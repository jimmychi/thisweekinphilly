const axios = require("axios");

const TM_BASE = "https://app.ticketmaster.com/discovery/v2";
const API_KEY = process.env.TICKETMASTER_API_KEY;

const CATEGORY_MAP = {
  concerts: { segmentName: "Music" },
  sports: { segmentName: "Sports" },
  arts: { segmentName: "Arts & Theatre" },
  family: { segmentName: "Family" },
  nightlife: { segmentName: "Music", genreId: "KnvZfZ7vAvF" },
};

async function getTicketmasterEvents(category = null, daysAhead = 7) {
  if (!API_KEY) {
    console.warn("TICKETMASTER_API_KEY not set");
    return [];
  }

  const now = new Date();
  const end = new Date();
  end.setDate(end.getDate() + daysAhead);

  const params = {
    apikey: API_KEY,
    city: "Philadelphia",
    stateCode: "PA",
    countryCode: "US",
    startDateTime: now.toISOString().split(".")[0] + "Z",
    endDateTime: end.toISOString().split(".")[0] + "Z",
    size: 50,
    sort: "date,asc",
  };

  if (category && CATEGORY_MAP[category]) {
    const catConfig = CATEGORY_MAP[category];
    if (catConfig.segmentName) params.segmentName = catConfig.segmentName;
    if (catConfig.genreId) params.genreId = catConfig.genreId;
  }

  try {
    const res = await axios.get(`${TM_BASE}/events.json`, { params });
    const rawEvents = res.data?._embedded?.events || [];
    return rawEvents.map(formatTMEvent);
  } catch (err) {
    console.error("Ticketmaster API error:", err.message);
    return [];
  }
}

async function getTicketmasterEventById(tmId) {
  if (!API_KEY) return null;
  try {
    const res = await axios.get(`${TM_BASE}/events/${tmId}.json`, {
      params: { apikey: API_KEY },
    });
    return formatTMEvent(res.data);
  } catch (err) {
    console.error("Ticketmaster event detail error:", err.message);
    return null;
  }
}

function formatTMEvent(e) {
  const images = e.images || [];
  const bestImage =
    images.find((img) => img.ratio === "16_9" && img.width > 1000)?.url ||
    images.find((img) => img.ratio === "16_9" && img.width > 500)?.url ||
    images[0]?.url ||
    null;

  const allImages = images
    .filter((img) => img.ratio === "16_9")
    .sort((a, b) => b.width - a.width)
    .map((img) => img.url);

  return {
    id: `tm-${e.id}`,
    source: "ticketmaster",
    title: e.name,
    category: mapTMCategory(e.classifications?.[0]),
    date: e.dates?.start?.localDate,
    time: e.dates?.start?.localTime,
    venue: e._embedded?.venues?.[0]?.name || "TBA",
    address: formatTMAddress(e._embedded?.venues?.[0]),
    image: bestImage,
    images: allImages,
    url: e.url,
    price: formatTMPrice(e.priceRanges),
    description: e.info || e.pleaseNote || null,
    seatmap: e.seatmap?.staticUrl || null,
  };
}

function mapTMCategory(classification) {
  if (!classification) return "other";
  const segment = classification.segment?.name?.toLowerCase() || "";
  const genre = classification.genre?.name?.toLowerCase() || "";
  if (segment === "music") return genre.includes("club") ? "nightlife" : "concerts";
  if (segment === "sports") return "sports";
  if (segment === "arts & theatre") return "arts";
  if (segment === "family") return "family";
  return "other";
}

function formatTMAddress(venue) {
  if (!venue) return "Philadelphia, PA";
  const parts = [venue.address?.line1, venue.city?.name, venue.state?.stateCode].filter(Boolean);
  return parts.join(", ");
}

function formatTMPrice(priceRanges) {
  if (!priceRanges?.length) return null;
  const range = priceRanges[0];
  if (range.min === range.max) return `$${range.min}`;
  return `$${range.min}–$${range.max}`;
}

module.exports = { getTicketmasterEvents, getTicketmasterEventById };