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
    let records = [];
    let offset = null;
    do {
      const params = { filterByFormula: "{Approved} = 1", pageSize: 100 };
      if (offset) params.offset = offset;
      const res = await axios.get(
        `https://api.airtable.com/v0/${AIRTABLE_BASE}/${encodeURIComponent(TABLE_NAME)}`,
        { params, headers: { Authorization: `Bearer ${AIRTABLE_KEY}` } }
      );
      records = records.concat(res.data.records || []);
      offset = res.data.offset || null;
    } while (offset);

    return records.map((r) => ({
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

async function getHappyHours() {
  if (!AIRTABLE_BASE || !AIRTABLE_KEY) return [];
  try {
    let records = [];
    let offset = null;
    do {
      const params = { filterByFormula: "{Active} = 1", pageSize: 100 };
      if (offset) params.offset = offset;
      const res = await axios.get(
        `https://api.airtable.com/v0/${AIRTABLE_BASE}/Happy%20Hours`,
        { params, headers: { Authorization: `Bearer ${AIRTABLE_KEY}` } }
      );
      records = records.concat(res.data.records || []);
      offset = res.data.offset || null;
    } while (offset);
    return records.map((r) => ({
      id: `hh-${r.id}`,
      name: r.fields["Restaurant Name"] || "",
      special: r.fields["Special"] || "",
      day: r.fields["Day"] || "",
      time: r.fields["Time"] || "",
      neighborhood: r.fields["Neighborhood"] || "",
      image: r.fields["Image"] || null,
      url: r.fields["URL"] || null,
      phone: r.fields["Phone"] || null,
      address: r.fields["Address"] || null,
    }));
  } catch (err) {
    console.error("Happy hours fetch error:", err.message);
    return [];
  }
}

async function getMuseums() {
  if (!AIRTABLE_BASE || !AIRTABLE_KEY) return [];
  try {
    const res = await axios.get(
      `https://api.airtable.com/v0/${AIRTABLE_BASE}/Museums`,
      {
        params: { filterByFormula: "{Active} = 1" },
        headers: { Authorization: `Bearer ${AIRTABLE_KEY}` },
      }
    );
    return (res.data.records || []).map((r) => ({
      id: `museum-${r.id}`,
      name: r.fields["Museum Name"] || "",
      description: r.fields["Description"] || null,
      address: r.fields["Address"] || null,
      phone: r.fields["Phone"] || null,
      hours: r.fields["Hours"] || null,
      admission: r.fields["Admission"] || null,
      special: r.fields["Special"] || null,
      image: r.fields["Image"] || null,
      url: r.fields["URL"] || null,
      neighborhood: r.fields["Neighborhood"] || null,
      kidFriendly: r.fields["Kid Friendly"] || false,
    }));
  } catch (err) {
    console.error("Museums fetch error:", err.message);
    return [];
  }
}

async function getAirtableRestaurants(neighborhood) {
  if (!AIRTABLE_BASE || !AIRTABLE_KEY) return [];
  try {
    let records = [];
    let offset = null;
    do {
      const params = { filterByFormula: "{Active} = 1", pageSize: 100 };
      if (offset) params.offset = offset;
      const res = await axios.get(
        `https://api.airtable.com/v0/${AIRTABLE_BASE}/Restaurants`,
        { params, headers: { Authorization: `Bearer ${AIRTABLE_KEY}` } }
      );
      records = records.concat(res.data.records || []);
      offset = res.data.offset || null;
    } while (offset);
    const mapped = records.map((r) => ({
      id: `at-rest-${r.id}`,
      name: r.fields["Restaurant Name"] || "",
      address: r.fields["Address"] || "Philadelphia, PA",
      phone: r.fields["Phone"] || null,
      website: r.fields["Website"] || null,
      neighborhood: r.fields["Neighborhood"] || null,
      cuisine: r.fields["Cuisine"] || null,
      rating: r.fields["Rating"] || null,
      priceLevel: r.fields["Price Level"] || null,
      description: r.fields["Description"] || null,
      image: r.fields["Image"] || null,
      placeId: r.fields["Place ID"] || null,
      type: r.fields["Type"] || "Restaurant",
      specials: r.fields["Specials"] || null,
    }));
    if (neighborhood && neighborhood !== "All") {
      return mapped.filter(r => r.neighborhood === neighborhood);
    }
    return mapped;
  } catch (err) {
    console.error("Airtable restaurants fetch error:", err.message);
    return [];
  }
}

async function syncRestaurantsToAirtable(googleRestaurants) {
  if (!AIRTABLE_BASE || !AIRTABLE_KEY) return;
  try {
    // Get existing Place IDs from Airtable
    let existing = [];
    let offset = null;
    do {
      const params = { fields: ["Place ID"], pageSize: 100 };
      if (offset) params.offset = offset;
      const res = await axios.get(
        `https://api.airtable.com/v0/${AIRTABLE_BASE}/Restaurants`,
        { params, headers: { Authorization: `Bearer ${AIRTABLE_KEY}` } }
      );
      existing = existing.concat(res.data.records || []);
      offset = res.data.offset || null;
    } while (offset);

    const existingPlaceIds = new Set(existing.map(r => r.fields["Place ID"]).filter(Boolean));

    // Filter to only new restaurants
    const newRestaurants = googleRestaurants.filter(r => r.id && !existingPlaceIds.has(r.id));

    if (newRestaurants.length === 0) return;

    // Insert in batches of 10 (Airtable limit)
    for (let i = 0; i < newRestaurants.length; i += 10) {
      const batch = newRestaurants.slice(i, i + 10);
      await axios.post(
        `https://api.airtable.com/v0/${AIRTABLE_BASE}/Restaurants`,
        {
          records: batch.map(r => ({
            fields: {
              "Restaurant Name": r.name,
              "Address": r.address || "",
              "Neighborhood": r.neighborhood || "",
              "Rating": r.rating || null,
              "Price Level": r.priceLevel ? "$".repeat(r.priceLevel) : null,
              "Place ID": r.id,
              "Image": r.image || null,
              "Active": false,
            }
          }))
        },
        { headers: { Authorization: `Bearer ${AIRTABLE_KEY}`, "Content-Type": "application/json" } }
      );
    }
    console.log(`Synced ${newRestaurants.length} new restaurants to Airtable`);
  } catch (err) {
    console.error("Restaurant sync error:", err.message);
  }
}

async function getAirtableBars(neighborhood) {
  if (!AIRTABLE_BASE || !AIRTABLE_KEY) return [];
  try {
    let records = [];
    let offset = null;
    do {
      const params = { filterByFormula: "{Active} = 1", pageSize: 100 };
      if (offset) params.offset = offset;
      const res = await axios.get(
        `https://api.airtable.com/v0/${AIRTABLE_BASE}/Bars`,
        { params, headers: { Authorization: `Bearer ${AIRTABLE_KEY}` } }
      );
      records = records.concat(res.data.records || []);
      offset = res.data.offset || null;
    } while (offset);
    const mapped = records.map((r) => ({
      id: `at-bar-${r.id}`,
      name: r.fields["Bar Name"] || "",
      address: r.fields["Address"] || "Philadelphia, PA",
      phone: r.fields["Phone"] || null,
      website: r.fields["Website"] || null,
      neighborhood: r.fields["Neighborhood"] || null,
      rating: r.fields["Rating"] || null,
      priceLevel: r.fields["Price Level"] || null,
      description: r.fields["Description"] || null,
      image: r.fields["Image"] || null,
      images: r.fields["Images"] ? r.fields["Images"].split(",") : [],
      placeId: r.fields["Place ID"] || null,
      specials: r.fields["Specials"] || null,
    }));
    if (neighborhood && neighborhood !== "All") {
      return mapped.filter(r => r.neighborhood === neighborhood);
    }
    return mapped;
  } catch (err) {
    console.error("Airtable bars fetch error:", err.message);
    return [];
  }
}

async function syncBarsToAirtable(googleBars) {
  if (!AIRTABLE_BASE || !AIRTABLE_KEY) return;
  try {
    let existing = [];
    let offset = null;
    do {
      const params = { fields: ["Place ID"], pageSize: 100 };
      if (offset) params.offset = offset;
      const res = await axios.get(
        `https://api.airtable.com/v0/${AIRTABLE_BASE}/Bars`,
        { params, headers: { Authorization: `Bearer ${AIRTABLE_KEY}` } }
      );
      existing = existing.concat(res.data.records || []);
      offset = res.data.offset || null;
    } while (offset);

    const existingPlaceIds = new Set(existing.map(r => r.fields["Place ID"]).filter(Boolean));
    const newBars = googleBars.filter(r => r.id && !existingPlaceIds.has(r.id));
    if (newBars.length === 0) return;

    for (let i = 0; i < newBars.length; i += 10) {
      const batch = newBars.slice(i, i + 10);
      await axios.post(
        `https://api.airtable.com/v0/${AIRTABLE_BASE}/Bars`,
        {
          records: batch.map(r => ({
            fields: {
              "Bar Name": r.name,
              "Address": r.address || "",
              "Neighborhood": r.neighborhood || "",
              "Rating": r.rating || null,
              "Price Level": r.priceLevel ? "$".repeat(r.priceLevel) : null,
              "Place ID": r.id,
              "Image": r.image || null,
              "Active": false,
              "Date Added": new Date().toISOString().split("T")[0],
            }
          }))
        },
        { headers: { Authorization: `Bearer ${AIRTABLE_KEY}`, "Content-Type": "application/json" } }
      );
    }
    console.log(`Synced ${newBars.length} new bars to Airtable`);
  } catch (err) {
    console.error("Bars sync error:", err.message);
  }
}

module.exports = { submitEvent, getApprovedEvents, getRestaurantSpecials, syncEventsToAirtable, getHappyHours, getMuseums, getAirtableRestaurants, syncRestaurantsToAirtable, getAirtableBars, syncBarsToAirtable };
