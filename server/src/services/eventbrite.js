const axios = require("axios");

const EB_BASE = "https://www.eventbriteapi.com/v3";
const API_KEY = process.env.EVENTBRITE_API_KEY;

async function getEventbriteEvents(category, daysAhead) {
  daysAhead = daysAhead || 7;
  if (!API_KEY) {
    console.warn("EVENTBRITE_API_KEY not set");
    return [];
  }

  const now = new Date();
  const end = new Date();
  end.setDate(end.getDate() + daysAhead);

  const params = {
    "location.address": "Philadelphia, PA",
    "location.within": "10mi",
    "start_date.range_start": now.toISOString(),
    "start_date.range_end": end.toISOString(),
    "expand": "venue,category",
    "page_size": 50,
    "sort_by": "date",
  };

  try {
    const res = await axios.get(`${EB_BASE}/events/search/`, {
      params,
      headers: { 
        Authorization: `Bearer ${API_KEY}`,
        "Accept": "application/json",
      },
    });

    const rawEvents = (res.data && res.data.events) || [];
    return rawEvents.map(function(e) {
      return {
        id: "eb-" + e.id,
        source: "eventbrite",
        title: e.name && e.name.text || "Untitled Event",
        category: mapEBCategory(e.category && e.category.name),
        date: e.start && e.start.local && e.start.local.split("T")[0],
        time: e.start && e.start.local && e.start.local.split("T")[1] && e.start.local.split("T")[1].slice(0, 5),
        venue: e.venue && e.venue.name || "Philadelphia",
        address: formatEBAddress(e.venue),
        image: e.logo && e.logo.url || null,
        url: e.url,
        price: e.is_free ? "Free" : null,
        description: e.description && e.description.text && e.description.text.slice(0, 200) || null,
      };
    });
  } catch (err) {
    console.error("Eventbrite API error:", err.response && err.response.status, err.message);
    return [];
  }
}

function mapEBCategory(categoryName) {
  if (!categoryName) return "other";
  const name = categoryName.toLowerCase();
  if (name.includes("music")) return "concerts";
  if (name.includes("art") || name.includes("film") || name.includes("theatre")) return "arts";
  if (name.includes("nightlife")) return "nightlife";
  if (name.includes("sport") || name.includes("fitness")) return "sports";
  if (name.includes("community") || name.includes("government")) return "community";
  return "other";
}

function formatEBAddress(venue) {
  if (!venue || !venue.address) return "Philadelphia, PA";
  const a = venue.address;
  return [a.address_1, a.city, a.region].filter(Boolean).join(", ");
}

module.exports = { getEventbriteEvents };
