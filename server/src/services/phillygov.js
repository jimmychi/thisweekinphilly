const axios = require("axios");

async function getPhillyGovEvents(daysAhead) {
  daysAhead = daysAhead || 7;

  try {
    const res = await axios.get(
      "https://www.phila.gov/api/v1/calendars/",
      { timeout: 8000 }
    );

    const calendars = res.data || [];
    const now = new Date();
    const end = new Date();
    end.setDate(end.getDate() + daysAhead);
    const allEvents = [];

    for (const cal of calendars) {
      const events = cal.events || [];
      for (const e of events) {
        if (!e.start_date) continue;
        const eventDate = new Date(e.start_date);
        if (eventDate < now || eventDate > end) continue;

        allEvents.push({
          id: "philly-" + (e.id || Math.random()),
          source: "city",
          title: e.title || "City Event",
          category: "community",
          date: e.start_date ? e.start_date.split("T")[0] : null,
          time: e.start_date && e.start_date.includes("T") ? e.start_date.split("T")[1].slice(0, 5) : null,
          venue: e.location || "Philadelphia, PA",
          address: e.address || "Philadelphia, PA",
          image: e.image_url || null,
          url: e.url || "https://www.phila.gov/events/",
          price: "Free",
          description: e.description || null,
        });
      }
    }

    return allEvents;
  } catch (err) {
    console.error("Philly Gov API error:", err.message);
    return [];
  }
}

module.exports = { getPhillyGovEvents };
