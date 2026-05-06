const axios = require("axios");

const PHQ_BASE = "https://api.predicthq.com/v1";
const API_KEY = process.env.PREDICTHQ_API_KEY;

async function getPredicthqEvents(category, daysAhead) {
  daysAhead = daysAhead || 7;
  if (!API_KEY) {
    console.warn("PREDICTHQ_API_KEY not set");
    return [];
  }

  const now = new Date();
  const end = new Date();
  end.setDate(end.getDate() + daysAhead);

  const params = {
    "place.scope": "5188843",
    "start.gte": now.toISOString().split("T")[0],
    "start.lte": end.toISOString().split("T")[0],
    "state": "active",
    limit: 50,
    sort: "start",
    country: "US",
  };

  const CATEGORY_MAP = {
    concerts: "concerts",
    sports: "sports",
    arts: "performing-arts",
    food: "festivals",
    family: "community",
    nightlife: "concerts",
    community: "community",
  };

  if (category && CATEGORY_MAP[category]) {
    params.category = CATEGORY_MAP[category];
  } else {
    params.category = "concerts,sports,performing-arts,festivals,community,expos";
  }

  try {
    const res = await axios.get(PHQ_BASE + "/events/", {
      params,
      headers: { Authorization: "Bearer " + API_KEY },
    });

    const rawEvents = (res.data && res.data.results) || [];

    const filtered = rawEvents.filter(function(e) {
      const title = e.title ? e.title.toLowerCase() : "";
      // Filter out non-Philly cities
      if (title.includes("erie") || title.includes("pittsburgh") || title.includes("allentown")) return false;
      // Filter out events with no real venue
      const hasVenue = e.entities && e.entities[0] && e.entities[0].name && e.entities[0].name !== "Philadelphia, PA";
      return hasVenue;
    });
    return filtered.map(function(e) {
      const start = e.start ? e.start.split("T") : [];
      return {
        id: "phq-" + e.id,
        source: "predicthq",
        title: e.title,
        category: mapPHQCategory(e.category),
        date: start[0] || null,
        time: start[1] ? start[1].slice(0, 5) : null,
        venue: e.entities && e.entities[0] && e.entities[0].name || "Philadelphia, PA",
        address: "Philadelphia, PA",
        image: null,
        url: "https://www.google.com/search?q=" + encodeURIComponent(e.title + " Philadelphia"),
        price: null,
        description: e.description ? e.description.replace("Sourced from predicthq.com - ", "").replace("Sourced from predicthq.com", "").trim() || null : null,
      };
    });
  } catch (err) {
    console.error("PredictHQ API error:", err.message);
    return [];
  }
}

function mapPHQCategory(category) {
  if (!category) return "other";
  if (category === "concerts") return "concerts";
  if (category === "sports") return "sports";
  if (category === "performing-arts") return "arts";
  if (category === "festivals") return "food";
  if (category === "community") return "community";
  return "other";
}

module.exports = { getPredicthqEvents };
