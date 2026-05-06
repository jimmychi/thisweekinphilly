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

const PHILLY_TEAMS = {
  "philadelphia phillies": { espnId: "phi", league: "baseball/mlb" },
  "philadelphia eagles": { espnId: "phi", league: "football/nfl" },
  "philadelphia 76ers": { espnId: "phi", league: "basketball/nba" },
  "76ers": { espnId: "phi", league: "basketball/nba" },
  "philadelphia flyers": { espnId: "phi", league: "hockey/nhl" },
  "phillies": { espnId: "phi", league: "baseball/mlb" },
  "eagles": { espnId: "phi", league: "football/nfl" },
  "flyers": { espnId: "phi", league: "hockey/nhl" },
};

async function getSportsDescription(eventTitle) {
  try {
    const titleLower = eventTitle.toLowerCase();
    let teamInfo = null;
    for (const [teamName, info] of Object.entries(PHILLY_TEAMS)) {
      if (titleLower.includes(teamName)) {
        teamInfo = info;
        break;
      }
    }
    if (!teamInfo) return null;
    const url = "https://site.api.espn.com/apis/site/v2/sports/" + teamInfo.league + "/teams/" + teamInfo.espnId;
    const res = await axios.get(url);
    const team = res.data && res.data.team;
    if (!team) return null;
    const record = team.record && team.record.items && team.record.items[0] && team.record.items[0].summary;
    const name = team.displayName;
    const standingSummary = team.standingSummary || null;
    let description = "The " + name;
    if (record) description += " are " + record + " this season";
    if (standingSummary) description += ", " + standingSummary;
    description += ". Click below to get your tickets!";
    return description;
  } catch (err) {
    console.error("ESPN API error:", err.message);
    return null;
  }
}

async function getTicketmasterEvents(category, daysAhead) {
  daysAhead = daysAhead || 7;
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
    const res = await axios.get(TM_BASE + "/events.json", { params });
    const rawEvents = (res.data && res.data._embedded && res.data._embedded.events) || [];
    return rawEvents.map(formatTMEvent);
  } catch (err) {
    console.error("Ticketmaster API error:", err.message);
    return [];
  }
}

async function getTicketmasterEventById(tmId) {
  if (!API_KEY) return null;
  try {
    const res = await axios.get(TM_BASE + "/events/" + tmId + ".json", {
      params: { apikey: API_KEY },
    });
    const event = formatTMEvent(res.data);
    if (event.category === "sports" && !event.description) {
      const sportsDesc = await getSportsDescription(event.title);
      if (sportsDesc) event.description = sportsDesc;
    }
    return event;
  } catch (err) {
    console.error("Ticketmaster event detail error:", err.message);
    return null;
  }
}

function formatTMEvent(e) {
  const images = e.images || [];
  const bestImage =
    images.find(function(img) { return img.ratio === "16_9" && img.width > 1000; }) ||
    images.find(function(img) { return img.ratio === "16_9" && img.width > 500; }) ||
    images[0] || null;
  return {
    id: "tm-" + e.id,
    source: "ticketmaster",
    title: e.name,
    category: mapTMCategory(e.classifications && e.classifications[0]),
    date: e.dates && e.dates.start && e.dates.start.localDate,
    time: e.dates && e.dates.start && e.dates.start.localTime,
    venue: (e._embedded && e._embedded.venues && e._embedded.venues[0] && e._embedded.venues[0].name) || "TBA",
    address: formatTMAddress(e._embedded && e._embedded.venues && e._embedded.venues[0]),
    image: bestImage ? bestImage.url : null,
    url: e.url,
    price: formatTMPrice(e.priceRanges),
    description: e.info || e.pleaseNote || null,
    seatmap: e.seatmap && e.seatmap.staticUrl || null,
  };
}

function mapTMCategory(classification) {
  if (!classification) return "other";
  const segment = (classification.segment && classification.segment.name && classification.segment.name.toLowerCase()) || "";
  const genre = (classification.genre && classification.genre.name && classification.genre.name.toLowerCase()) || "";
  if (segment === "music") return genre.includes("club") ? "nightlife" : "concerts";
  if (segment === "sports") return "sports";
  if (segment === "arts & theatre") return "arts";
  if (segment === "family") return "family";
  return "other";
}

function formatTMAddress(venue) {
  if (!venue) return "Philadelphia, PA";
  const parts = [venue.address && venue.address.line1, venue.city && venue.city.name, venue.state && venue.state.stateCode].filter(Boolean);
  return parts.join(", ");
}

function formatTMPrice(priceRanges) {
  if (!priceRanges || !priceRanges.length) return null;
  const range = priceRanges[0];
  if (range.min === range.max) return "$" + range.min;
  return "$" + range.min + "-$" + range.max;
}

module.exports = { getTicketmasterEvents, getTicketmasterEventById };
