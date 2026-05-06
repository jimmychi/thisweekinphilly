const axios = require("axios");

const APP_ID = "thisweekinphilly";

async function getBandsintownEvents(daysAhead) {
  daysAhead = daysAhead || 7;

  const now = new Date();
  const end = new Date();
  end.setDate(end.getDate() + daysAhead);
  const dateFrom = now.toISOString().split("T")[0];
  const dateTo = end.toISOString().split("T")[0];

  try {
    const res = await axios.get(
      "https://rest.bandsintown.com/v4/metro-areas/philadelphia-pa-us/events",
      {
        params: {
          app_id: APP_ID,
          date: dateFrom + "," + dateTo,
        },
        timeout: 8000,
      }
    );

    const events = res.data || [];
    return events.map(function(e) {
      return {
        id: "bit-" + e.id,
        source: "bandsintown",
        title: e.lineup ? e.lineup.join(", ") : "Live Music",
        category: "concerts",
        date: e.datetime ? e.datetime.split("T")[0] : null,
        time: e.datetime ? e.datetime.split("T")[1]?.slice(0, 5) : null,
        venue: e.venue?.name || "Philadelphia",
        address: e.venue ? [e.venue.street_address, e.venue.city, e.venue.region].filter(Boolean).join(", ") : "Philadelphia, PA",
        image: e.artist?.image_url || null,
        url: e.url || null,
        price: null,
        description: null,
      };
    });
  } catch (err) {
    console.error("Bandsintown error:", err.message);
    return [];
  }
}

module.exports = { getBandsintownEvents };
