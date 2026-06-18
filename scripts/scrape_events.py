import requests
import time
import os
from datetime import datetime, timedelta
from bs4 import BeautifulSoup
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail

AIRTABLE_BASE_ID = os.environ.get("AIRTABLE_BASE_ID")
AIRTABLE_API_KEY = os.environ.get("AIRTABLE_API_KEY")
SENDGRID_API_KEY = os.environ.get("SENDGRID_API_KEY")
TICKETMASTER_API_KEY = os.environ.get("TICKETMASTER_API_KEY")
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

def scrape_ticketmaster():
    events = []
    if not TICKETMASTER_API_KEY:
        print("No Ticketmaster API key, skipping")
        return events
    try:
        url = "https://app.ticketmaster.com/discovery/v2/events.json"
        params = {
            "apikey": TICKETMASTER_API_KEY,
            "city": "Philadelphia",
            "stateCode": "PA",
            "countryCode": "US",
            "size": 50,
            "sort": "date,asc",
            "startDateTime": datetime.now().strftime("%Y-%m-%dT%H:%M:%SZ"),
            "endDateTime": (datetime.now() + timedelta(days=14)).strftime("%Y-%m-%dT%H:%M:%SZ"),
        }
        res = requests.get(url, params=params, timeout=15)
        print(f"Ticketmaster status: {res.status_code}")
        data = res.json()
        tm_events = data.get("_embedded", {}).get("events", [])
        print(f"Ticketmaster found: {len(tm_events)} events")
        for e in tm_events:
            venue = e.get("_embedded", {}).get("venues", [{}])[0]
            image = next((img["url"] for img in e.get("images", []) if img.get("ratio") == "16_9"), "")
            start = e.get("dates", {}).get("start", {})
            date = start.get("localDate", "")
            time_str = start.get("localTime", "")[:5] if start.get("localTime") else ""
            price_ranges = e.get("priceRanges", [])
            price = f"${price_ranges[0]['min']:.0f}+" if price_ranges else ""
            events.append({
                "title": e.get("name", ""),
                "date": date,
                "time": time_str,
                "venue": venue.get("name", "Philadelphia, PA"),
                "address": f"{venue.get('address', {}).get('line1', '')}, {venue.get('city', {}).get('name', 'Philadelphia')}, PA",
                "url": e.get("url", ""),
                "image": image,
                "price": price,
                "description": "",
                "source": "ticketmaster",
                "category": detect_category(e.get("name", ""), e.get("classifications", [])),
            })
        print(f"Ticketmaster: {len(events)} events parsed")
    except Exception as e:
        print(f"Ticketmaster error: {e}")
    return events

def scrape_do215():
    events = []
    try:
        today = __import__('datetime').datetime.now()
        for i in range(14):
            day = today + __import__('datetime').timedelta(days=i)
            url = f"https://do215.com/events/{day.strftime('%Y/%m/%d')}"
            res = __import__('requests').get(url, headers={"User-Agent": "Mozilla/5.0"}, timeout=15)
            print("Do215 " + day.strftime("%Y-%m-%d") + " status: " + str(res.status_code))
            if res.status_code != 200:
                continue
            from bs4 import BeautifulSoup
            soup = BeautifulSoup(res.text, "html.parser")
            event_items = soup.select("div.ds-listing.event-card")
            print("Found " + str(len(event_items)) + " events")
            for item in event_items:
                title_el = item.select_one("span.ds-listing-event-title-text")
                link_el = item.select_one("a.ds-listing-event-title")
                venue_el = item.select_one("div.ds-venue-name span[itemprop='name']")
                time_el = item.select_one(".ds-event-time")
                cover_el = item.select_one("div.ds-cover-image")
                if not title_el:
                    continue
                title = title_el.get_text(strip=True)
                if not title:
                    continue
                link = link_el.get("href", "") if link_el else ""
                if link and not link.startswith("http"):
                    link = "https://do215.com" + link
                # Extract image from background-image CSS
                image = ""
                if cover_el:
                    style = cover_el.get("style", "")
                    import re
                    match = re.search(r"url\([\'\"]?(.+?)[\'\"]?\)", style)
                    if match:
                        image = match.group(1)
                # Extract category from card class
                card_classes = " ".join(item.get("class", []))
                cat = detect_category_do215(title, card_classes)
                events.append({
                    "title": title,
                    "date": day.strftime("%Y-%m-%d"),
                    "time": time_el.get_text(strip=True) if time_el else "",
                    "venue": venue_el.get_text(strip=True) if venue_el else "Philadelphia, PA",
                    "address": "Philadelphia, PA",
                    "url": link,
                    "image": image,
                    "price": "",
                    "description": "",
                    "source": "do215",
                    "category": cat,
                })
            __import__('time').sleep(0.5)
        print(f"Do215: {len(events)} events parsed")
    except Exception as e:
        print(f"Do215 error: {e}")
    return events

def detect_category_do215(title, classes):
    classes = classes.lower()
    title = title.lower()
    if "music" in classes or "concert" in classes:
        return "concerts"
    if "comedy" in classes:
        return "arts"
    if "dj-parties" in classes or "lgbtq" in classes or "karaoke" in classes:
        return "nightlife"
    if "arts" in classes or "theater" in classes or "film" in classes:
        return "arts"
    if "sports" in classes or "fitness" in classes:
        return "sports"
    if "food" in classes or "drink" in classes:
        return "nightlife"
    return detect_category(title, [])

def detect_category(title, classifications=None):
    title = title.lower()
    if classifications:
        segment = classifications[0].get("segment", {}).get("name", "").lower() if classifications else ""
        if segment == "music":
            return "concerts"
        if segment == "sports":
            return "sports"
        if segment in ["arts & theatre", "arts"]:
            return "arts"
    if any(w in title for w in ["concert", "music", "band", "jazz", "hip hop", "rock", "live music", "tour"]):
        return "concerts"
    if any(w in title for w in ["game", "eagles", "phillies", "sixers", "flyers", "sport", "race", "marathon"]):
        return "sports"
    if any(w in title for w in ["art", "gallery", "exhibit", "museum", "theater", "theatre", "ballet", "opera", "comedy"]):
        return "arts"
    if any(w in title for w in ["bar", "nightclub", "dj", "club", "nightlife", "party", "rave", "drag", "brunch"]):
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

    for source, scraper in [("ticketmaster", scrape_ticketmaster), ("do215", scrape_do215)]:
        events = scraper()
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
# DEBUG - remove after testing
