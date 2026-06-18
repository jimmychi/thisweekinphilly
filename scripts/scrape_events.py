import requests
import json
import time
import os
from datetime import datetime, timedelta
from bs4 import BeautifulSoup
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail

AIRTABLE_BASE_ID = os.environ.get("AIRTABLE_BASE_ID")
AIRTABLE_API_KEY = os.environ.get("AIRTABLE_API_KEY")
SENDGRID_API_KEY = os.environ.get("SENDGRID_API_KEY")
EVENTBRITE_API_KEY = os.environ.get("EVENTBRITE_API_KEY")
NOTIFY_EMAIL = "jimmychi213@gmail.com"
FROM_EMAIL = "info@thisweekinphilly.com"

TABLE_NAME = "Table 1"
HEADERS = {"Authorization": f"Bearer {AIRTABLE_API_KEY}", "Content-Type": "application/json"}

def get_existing_urls():
    urls = set()
    offset = None
    while True:
        params = {"fields[]": "URL", "pageSize": 100}
        if offset:
            params["offset"] = offset
        res = requests.get(
            f"https://api.airtable.com/v0/{AIRTABLE_BASE_ID}/{requests.utils.quote(TABLE_NAME)}",
            headers=HEADERS, params=params
        )
        data = res.json()
        for r in data.get("records", []):
            url = r.get("fields", {}).get("URL")
            if url:
                urls.add(url.strip())
        offset = data.get("offset")
        if not offset:
            break
    print(f"Found {len(urls)} existing event URLs in Airtable")
    return urls

def upload_to_airtable(events):
    if not events:
        return 0
    uploaded = 0
    for i in range(0, len(events), 10):
        batch = events[i:i+10]
        records = []
        for e in batch:
            records.append({"fields": {
                "Event Name": e.get("title", ""),
                "Date": e.get("date", ""),
                "Time": e.get("time", ""),
                "Venue": e.get("venue", ""),
                "Address": e.get("address", ""),
                "Category": e.get("category", "community"),
                "Image URL": e.get("image", ""),
                "URL": e.get("url", ""),
                "Price": e.get("price", ""),
                "Description": e.get("description", ""),
                "Source": e.get("source", ""),
                "Approved": False,
            }})
        res = requests.post(
            f"https://api.airtable.com/v0/{AIRTABLE_BASE_ID}/{requests.utils.quote(TABLE_NAME)}",
            headers=HEADERS, json={"records": records}
        )
        if res.status_code == 200:
            uploaded += len(batch)
        else:
            print(f"Airtable error: {res.text}")
        time.sleep(0.25)
    return uploaded

def scrape_eventbrite():
    events = []
    if not EVENTBRITE_API_KEY:
        print("No Eventbrite API key, skipping")
        return events
    try:
        # Search for Philadelphia events
        url = "https://www.eventbriteapi.com/v3/events/search/"
        params = {
            "location.address": "Philadelphia, PA",
            "location.within": "10mi",
            "expand": "venue,ticket_availability",
            "sort_by": "date",
            "start_date.range_start": datetime.now().strftime("%Y-%m-%dT%H:%M:%SZ"),
            "start_date.range_end": (datetime.now() + timedelta(days=14)).strftime("%Y-%m-%dT%H:%M:%SZ"),
        }
        headers = {"Authorization": f"Bearer {EVENTBRITE_API_KEY}"}
        res = requests.get(url, params=params, headers=headers, timeout=15)
        print(f"Eventbrite status: {res.status_code}")
        if res.status_code != 200:
            print(f"Eventbrite error: {res.text[:200]}")
            return events
        data = res.json()
        print(f"Eventbrite total events found: {data.get('pagination', {}).get('object_count', 0)}")
        for e in data.get("events", [])[:30]:
            venue = e.get("venue", {}) or {}
            address = venue.get("address", {}) or {}
            is_free = e.get("is_free", False)
            events.append({
                "title": e.get("name", {}).get("text", ""),
                "date": e.get("start", {}).get("local", "")[:10],
                "time": e.get("start", {}).get("local", "")[11:16],
                "venue": venue.get("name", "Philadelphia, PA"),
                "address": address.get("localized_address_display", ""),
                "url": e.get("url", ""),
                "image": e.get("logo", {}).get("url", "") if e.get("logo") else "",
                "price": "Free" if is_free else "",
                "description": e.get("description", {}).get("text", "")[:500] if e.get("description") else "",
                "source": "eventbrite",
                "category": detect_category(e.get("name", {}).get("text", "")),
            })
        print(f"Eventbrite: {len(events)} events parsed")
    except Exception as e:
        print(f"Eventbrite error: {e}")
    return events

def detect_category(title):
    title = title.lower()
    if any(w in title for w in ["concert", "music", "band", "jazz", "hip hop", "rock", "live music"]):
        return "concerts"
    if any(w in title for w in ["game", "eagles", "phillies", "sixers", "flyers", "sport", "race", "marathon"]):
        return "sports"
    if any(w in title for w in ["art", "gallery", "exhibit", "museum", "theater", "theatre", "ballet", "opera"]):
        return "arts"
    if any(w in title for w in ["bar", "nightclub", "dj", "club", "nightlife", "party", "rave"]):
        return "nightlife"
    return "community"

def send_notification(new_count, sources):
    if not SENDGRID_API_KEY:
        print("No SendGrid key, skipping email")
        return
    try:
        message = Mail(
            from_email=FROM_EMAIL,
            to_emails=NOTIFY_EMAIL,
            subject=f"ThisWeekInPhilly: {new_count} new events imported",
            html_content=f"""
            <h2>Weekly Event Import Complete</h2>
            <p><strong>{new_count} new events</strong> were added to Airtable and are awaiting your review.</p>
            <h3>Sources:</h3>
            <ul>
                {"".join(f"<li>{s}: {c} events</li>" for s, c in sources.items())}
            </ul>
            <p><a href="https://airtable.com">Review events in Airtable</a> and set Approved = true to make them live.</p>
            """
        )
        sg = SendGridAPIClient(SENDGRID_API_KEY)
        response = sg.send(message)
        print(f"Email sent, status: {response.status_code}")
    except Exception as e:
        print(f"Email error: {e}")

def main():
    print("Starting weekly event scrape...")
    existing_urls = get_existing_urls()

    all_events = []
    source_counts = {}

    # Eventbrite
    events = scrape_eventbrite()
    new_events = [e for e in events if e.get("url") and e["url"] not in existing_urls]
    source_counts["eventbrite"] = len(new_events)
    all_events.extend(new_events)
    print(f"Eventbrite: {len(new_events)} new events after dedup")

    print(f"Total new events to upload: {len(all_events)}")
    uploaded = upload_to_airtable(all_events)
    print(f"Successfully uploaded {uploaded} events")

    send_notification(uploaded, source_counts)
    print("Done!")

if __name__ == "__main__":
    main()
