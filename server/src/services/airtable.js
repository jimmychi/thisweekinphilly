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
      id: `at-${r.id}`,
      source: "community",
      title: r.fields["Event Name"],
      date: r.fields["Date"],
      time: r.fields["Time"],
      venue: r.fields["Venue"] || "Philadelphia, PA",
      address: "Philadelphia, PA",
      image: r.fields["Image URL"] || null,
      url: r.fields["URL"] || null,
      price: null,
      description: r.fields["Description"] || null,
      category: r.fields["Category"] || "community",
    }));
  } catch (err) {
    console.error("Airtable fetch error:", err.message);
    return [];
  }
}

module.exports = { submitEvent, getApprovedEvents };
