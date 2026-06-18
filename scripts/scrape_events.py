import requests
import json
import time
import os
import re
from datetime import datetime, timedelta
from bs4 import BeautifulSoup
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail

AIRTABLE_BASE_ID = os.environ.get("AIRTABLE_BASE_ID")
AIRTABLE_API_KEY = os.environ.get("AIRTABLE_API_KEY")
SENDGRID_API_KEY = os.environ.get("SENDGRID_API_KEY")
EVENTBRITE_API_KEY = os.environ.get("EVENTBRITE_API_KEY")
NOTIFY_EMAIL = "jimmychi213@gmail.com"
FROM_EMAIL = "thisweekinphilly@gmail.com"

TABLE_NAME = "Table 1"
HEADERS = {"Authorization": f"Bearer {AIRTABLE_API_KEY}", "Content-Type": "application/json"}

def get_existing_urls():
    """Get all existing event URLs from Airtable to avoid duplicates."""
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
    """Upload events to Airtable in batches of 10."""
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

def scrape_visit_philly():
    """Scrape events from Visit Philadelphia."""
    events = []
    try:
        url = "https://www.visitphilly.com/things-to-do/events/"
        res = requests.get(url, headers={"User-Agent": "Mozilla/5.0"}, timeout=15)
        soup = BeautifulSoup(res.text, "html.parser")
        cards = soup.select("article.m-listing") or soup.select(".event-card") or soup.select("[class*='event']")
        for card in cards[:20]:
            title_el = card.select_one("h2, h3, .title, [class*='title']")
            date_el = card.select_one("time, [class*='date']")
            link_el = card.select_one("a[href]")
            img_el = card.select_one("img")
            if not title_el:
                continue
            events.append({
                "title": title_el.get_text(strip=True),
                "date": date_el.get("datetime", date_el.get_text(strip=True))[:10] if date_el else "",
                "url": link_el["href"] if link_el else "",
                "image": img_el.get("src", img_el.get("data-src", "")) if img_el else "",
                "source": "visitphilly",
                "category": detect_category(title_el.get_text(strip=True)),
                "venue": "Philadelphia, PA",
            })
        print(f"Visit Philly: {len(events)} events")
    except Exception as e:
        print(f"Visit Philly scrape error: {e}")
    return events

def scrape_philly_mag():
    """Scrape events from Philly Mag."""
    events = []
    try:
        url = "https://www.phillymag.com/things-to-do/"
        res = requests.get(url, headers={"User-Agent": "Mozilla/5.0"}, timeout=15)
        soup = BeautifulSoup(res.text, "html.parser")
        cards = soup.select("article") or soup.select(".post")
        for card in cards[:20]:
            title_el = card.select_one("h2, h3, .entry-title")
            link_el = card.select_one("a[href]")
            img_el = card.select_one("img")
            if not title_el:
                continue
            events.append({
                "title": title_el.get_text(strip=True),
                "date": get_next_sunday(),
                "url": link_el["href"] if link_el else "",
                "image": img_el.get("src", img_el.get("data-src", "")) if img_el else "",
                "source": "phillymag",
                "category": detect_category(title_el.get_text(strip=True)),
                "venue": "Philadelphia, PA",
            })
        print(f"Philly Mag: {len(events)} events")
    except Exception as e:
        print(f"Philly Mag scrape error: {e}")
    return events

def scrape_philly_voice():
    """Scrape events from Philly Voice."""
    events = []
    try:
        url = "https://www.phillyvoice.com/events/"
        res = requests.get(url, headers={"User-Agent": "Mozilla/5.0"}, timeout=15)
        soup = BeautifulSoup(res.text, "html.parser")
        cards = soup.select("article") or soup.select(".event")
        for card in cards[:20]:
            title_el = card.select_one("h2, h3, .title")
            link_el = card.select_one("a[href]")
            img_el = card.select_one("img")
            if not title_el:
                continue
            events.append({
                "title": title_el.get_text(strip=True),
                "date": get_next_sunday(),
                "url": link_el["href"] if link_el else "",
                "image": img_el.get("src", img_el.get("data-src", "")) if img_el else "",
                "source": "phillyvoice",
                "category": detect_category(title_el.get_text(strip=True)),
                "venue": "Philadelphia, PA",
            })
        print(f"Philly Voice: {len(events)} events")
    except Exception as e:
        print(f"Philly Voice scrape error: {e}")
    return events

def scrape_eventbrite():
    """Fetch events from Eventbrite API."""
    events = []
    if not EVENTBRITE_API_KEY:
        print("No Eventbrite API key, skipping")
        return events
    try:
        url = "https://www.eventbriteapi.com/v3/events/search/"
        params = {
            "location.address": "Philadelphia, PA",
            "location.within": "10mi",
            "expand": "venue",
            "sort_by": "date",
            "token": EVENTBRITE_API_KEY,
        }
        res = requests.get(url, params=params, timeout=15)
        data = res.json()
        for e in data.get("events", [])[:30]:
            venue = e.get("venue", {})
            events.append({
                "title": e.get("name", {}).get("text", ""),
                "date": e.get("start", {}).get("local", "")[:10],
                "time": e.get("start", {}).get("local", "")[11:16],
                "venue": venue.get("name", "Philadelphia, PA"),
                "address": venue.get("address", {}).get("localized_address_display", ""),
                "url": e.get("url", ""),
                "image": e.get("logo", {}).get("url", "") if e.get("logo") else "",
                "price": "Free" if e.get("is_free") else "",
                "description": e.get("description", {}).get("text", "")[:500] if e.get("description") else "",
                "source": "eventbrite",
                "category": detect_category(e.get("name", {}).get("text", "")),
            })
        print(f"Eventbrite: {len(events)} events")
    except Exception as e:
        print(f"Eventbrite error: {e}")
    return events

def detect_category(title):
    """Detect event category from title keywords."""
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

def get_next_sunday():
    """Get the date of next Sunday."""
    today = datetime.now()
    days_until_sunday = (6 - today.weekday()) % 7
    if days_until_sunday == 0:
        days_until_sunday = 7
    return (today + timedelta(days=days_until_sunday)).strftime("%Y-%m-%d")

def send_notification(new_count, sources):
    """Send email notification via SendGrid."""
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
        sg.send(message)
        print(f"Notification sent to {NOTIFY_EMAIL}")
    except Exception as e:
        print(f"Email error: {e}")

def main():
    print("Starting weekly event scrape...")
    existing_urls = get_existing_urls()

    all_events = []
    source_counts = {}

    scrapers = [
        ("visitphilly", scrape_visit_philly),
        ("phillymag", scrape_philly_mag),
        ("phillyvoice", scrape_philly_voice),
        ("eventbrite", scrape_eventbrite),
    ]

    for source, scraper in scrapers:
        events = scraper()
        # Filter out duplicates
        new_events = [e for e in events if e.get("url") and e["url"] not in existing_urls]
        source_counts[source] = len(new_events)
        all_events.extend(new_events)
        print(f"{source}: {len(new_events)} new events after dedup")

    print(f"Total new events to upload: {len(all_events)}")
    uploaded = upload_to_airtable(all_events)
    print(f"Successfully uploaded {uploaded} events")

    send_notification(uploaded, source_counts)
    print("Done!")

if __name__ == "__main__":
    main()
