const axios = require("axios");

const APP_ID = "thisweekinphilly";

async function getBandsintownEvents(daysAhead) {
  daysAhead = daysAhead || 7;
  
  // List of major Philly venues to pull events from
  const venues = [
    "Union-Transfer",
    "Theatre-of-Living-Arts",
    "Franklin-Music-Hall",
    "The-Fillmore-Philadelphia",
    "Underground-Arts",
    "World-Cafe-Live",
    "First-Unitarian-Church",
    "Kung-Fu-Necktie",
    "Johnny-Brendas",
    "Boot-and-Saddle",
  ];

  const now = new Date();
  const end = new Date();
  end.setDate(end.getDate() + daysAhead);
  const dateFrom = now.toISOString().split("T")[0];
  const dateTo = end.toISOString().split("T")[0];

  const allEvents = [];

  for (const venue of venues) {
    try {
      const res = await axios.get(
        `https://rest.bandsintown.com/v4/venues/${venue}/events`,
        {
          params: {
            app_id: APP_ID,
            date: `${dateFrom},${dateTo}`,
          },
          timeout: 5000,
        }
      );

      const events = res.data || [];
      for (const e of events) {
        allEvents.push({
          id: "bit-" + e.id,
          source: "bandsintown",
          title: e.lineup ? e.lineup.join(", ") : e.artist_name || "Live Music",
          category: "concerts",
          date: e.datetime ? e.datetime.split("T")[0] : null,
          time: e.datetime ? e.datetime.split("T")[1]?.slice(0, 5) : null,
          venue: e.venue?.name || venue.replace(/-/g, " "),
          address: e.venue ? [e.venue.street_address, e.venue.city, e.venue.region].filter(Boolean).join(", ") : "Philadelphia, PA",
          image: e.artist?.image_url || null,
          url: e.url || null,
          price: null,
          description: null,
          category: "concerts",
        });
      }
    } catch (err) {
      // Silently skip venues that fail
    }
  }

  return allEvents;
}

module.exports = { getBandsintownEvents };
