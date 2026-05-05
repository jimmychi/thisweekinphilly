const axios = require("axios");

const EB_BASE = "https://www.eventbriteapi.com/v3";
const API_KEY = process.env.EVENTBRITE_API_KEY;

// Eventbrite category IDs
const CATEGORY_IDS = {
  concerts: "103",       // Music
  food: "110",           // Food & Drink
  arts: "105",           // Arts
  family: "115",         // Family & Education
  nightlife: "113",      // Nightlife & Singles
  community: "113",      // Community
  sports: "108",         // Sports & Fitness
};

async function getEventbriteEvents(category = null, daysAhead = 7) {
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
    expand: "venue,category",
    page_size: 50,
    sort_by: "date",
  };

  if (category && CATEGORY_IDS[category]) {
    params.categories = CATEGORY_IDS[category];
  }

  try {
    const res = await axios.get(`${EB_BASE}/events/search/`, {
      params,
      headers: { Authorization: `Bearer ${API_KEY}` },
    });

    const rawEvents = res.data?.events || [];

    return rawEvents.map((e) => ({
      id: `eb-${e.id}`,
      source: "eventbrite",
      title: e.name?.text || "Untitled Event",
      category: mapEBCategory(e.category?.name),
      date: e.start?.local?.split("T")[0],
      time: e.start?.local?.split("T")[1]?.slice(0, 5),
      venue: e.venue?.name || "TBA",
      address: formatEBAddress(e.venue),
      image: e.logo?.url || null,
      url: e.url,
      price: e.is_free ? "Free" : null,
      description: e.description?.text?.slice(0, 200) || null,
    }));
  } catch (err) {
    console.error("Eventbrite API error:", err.message);
    return [];
  }
}

function mapEBCategory(categoryName) {
  if (!categoryName) return "other";
  const name = categoryName.toLowerCase();
  if (name.includes("music")) return "concerts";
  if (name.includes("food") || name.includes("drink")) return "food";
  if (name.includes("art") || name.includes("film") || name.includes("theatre")) return "arts";
  if (name.includes("family") || name.includes("education")) return "family";
  if (name.includes("nightlife") || name.includes("singles")) return "nightlife";
  if (name.includes("sport") || name.includes("fitness")) return "sports";
  if (name.includes("community") || name.includes("government")) return "community";
  return "other";
}

function formatEBAddress(venue) {
  if (!venue?.address) return "Philadelphia, PA";
  const a = venue.address;
  return [a.address_1, a.city, a.region].filter(Boolean).join(", ");
}

module.exports = { getEventbriteEvents };
