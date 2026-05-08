const axios = require("axios");

const AIRTABLE_BASE = process.env.AIRTABLE_BASE_ID;
const AIRTABLE_KEY = process.env.AIRTABLE_API_KEY;
const TABLE_NAME = "Table 1";

async function submitEvent(eventData) {
  if (!AIRTABLE_BASE || !AIRTABLE_KEY) {
    console.warn("Airtable credentials not set");
    return null;
  }

  try {
    const res = await axios.post(
      `https://api.airtable.com/v0/${AIRTABLE_BASE}/${encodeURIComponent(TABLE_NAME)}`,
      {
        fields: {
          "Event Name": eventData.title,
          "Date": eventData.date,
          "Time": eventData.time,
          "Venue": eventData.venue,
          "Description": eventData.description,
          "URL": eventData.url,
          "Email": eventData.email,
          "Approved": false,
          "Image URL": eventData.image || null,
          "From Form": true,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${AIRTABLE_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );
    return res.data;
  } catch (err) {
    console.error("Airtable submit error:", err.response?.data || err.message);
    return null;
  }
}

async function getApprovedEvents() {
  if (!AIRTABLE_BASE || !AIRTABLE_KEY) return [];

  try {
    const res = await axios.get(
      `https://api.airtable.com/v0/${AIRTABLE_BASE}/${encodeURIComponent(TABLE_NAME)}`,
      {
        params: { filterByFormula: "{Approved} = 1" },
        headers: { Authorization: `Bearer ${AIRTABLE_KEY}` },
      }
    );

    return (res.data.records || []).map((r) => ({
      id: r.fields["Event ID"] ? r.fields["Event ID"] : `at-${r.id}`,
      source: r.fields["Source"] || "community",
      title: r.fields["Event Name"],
      date: r.fields["Date"],
      time: r.fields["Time"],
      venue: r.fields["Venue"] || "Philadelphia, PA",
      address: r.fields["Address"] || "Philadelphia, PA",
      image: r.fields["Image URL"] || null,
      url: r.fields["URL"] || null,
      price: r.fields["Price"] || null,
      description: r.fields["Description"] || null,
      category: (r.fields["Category"] || "community").toLowerCase(),
      phone: r.fields["Phone"] || null,
    }));
  } catch (err) {
    console.error("Airtable fetch error:", err.message);
    return [];
  }
}

async function getRestaurantSpecials() {
  if (!AIRTABLE_BASE || !AIRTABLE_KEY) return [];

  try {
    const res = await axios.get(
      `https://api.airtable.com/v0/${AIRTABLE_BASE}/Restaurants`,
      {
        params: { filterByFormula: "{Active} = 1" },
        headers: { Authorization: `Bearer ${AIRTABLE_KEY}` },
      }
    );

    return (res.data.records || []).map((r) => ({
      id: `rest-${r.id}`,
      name: r.fields["Restaurant Name"] || r.fields["Name"] || "",
      special: r.fields["Special"] || null,
      description: r.fields["Description"] || null,
      day: r.fields["Day"] || null,
      time: r.fields["Time"] || null,
      neighborhood: r.fields["Neighborhood"] || null,
      image: r.fields["Image"] || null,
    }));
  } catch (err) {
    console.error("Airtable restaurants fetch error:", err.message);
    return [];
  }
}


async function syncEventsToAirtable(events) {
  if (!AIRTABLE_BASE || !AIRTABLE_KEY) return;

  // Get existing Event IDs to avoid duplicates
  let existingIds = new Set();
  try {
    let offset = null;
    do {
      const params = { fields: ["Event ID"], pageSize: 100 };
      if (offset) params.offset = offset;
      const res = await axios.get(
        `https://api.airtable.com/v0/${AIRTABLE_BASE}/${encodeURIComponent(TABLE_NAME)}`,
        { params, headers: { Authorization: `Bearer ${AIRTABLE_KEY}` } }
      );
      (res.data.records || []).forEach(r => {
        if (r.fields["Event ID"]) existingIds.add(r.fields["Event ID"]);
      });
      offset = res.data.offset;
    } while (offset);
  } catch (err) {
    console.error("Airtable fetch existing IDs error:", err.message);
  }

  // Filter out events already in Airtable
  const newEvents = events.filter(e => e.id && !existingIds.has(e.id));
  if (!newEvents.length) {
    console.log("No new events to sync");
    return;
  }

  // Airtable allows max 10 records per request
  const chunks = [];
  for (let i = 0; i < newEvents.length; i += 10) {
    chunks.push(newEvents.slice(i, i + 10));
  }

  let synced = 0;
  for (const chunk of chunks) {
    try {
      await axios.post(
        `https://api.airtable.com/v0/${AIRTABLE_BASE}/${encodeURIComponent(TABLE_NAME)}`,
        {
          records: chunk.map(e => ({
            fields: {
              "Event Name": e.title || "",
              "Date": e.date || "",
              "Time": e.time || "",
              "Venue": e.venue || "",
              "Address": e.address || "",
              "Category": e.category || "other",
              "Image URL": e.image || "",
              "URL": e.url || "",
              "Price": e.price || "",
              "Description": e.description || "",
              "Source": e.source || "",
              "Phone": e.phone || "",
              "Event ID": e.id || "",
              "Approved": true,
            }
          }))
        },
        { headers: { Authorization: `Bearer ${AIRTABLE_KEY}`, "Content-Type": "application/json" } }
      );
      synced += chunk.length;
      // Rate limit: 5 requests per second
      await new Promise(r => setTimeout(r, 250));
    } catch (err) {
      console.error("Airtable sync chunk error:", err.response?.data || err.message);
    }
  }
  console.log(`Synced ${synced} new events to Airtable`);
}

module.exports = { submitEvent, getApprovedEvents, getRestaurantSpecials, syncEventsToAirtable };
