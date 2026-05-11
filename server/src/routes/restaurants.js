const express = require("express");
const axios = require("axios");
const NodeCache = require("node-cache");
const { getPhillyRestaurants, getPhillyBars, getPhillyNightclubs, getRestaurantDetails, PHILLY_NEIGHBORHOODS } = require("../services/restaurants");

const router = express.Router();
const cache = new NodeCache({ stdTTL: 3600 });

router.get("/", async (req, res) => {
  const neighborhood = req.query.neighborhood || null;
  const cuisine = req.query.cuisine || null;
  const cacheKey = `restaurants-${neighborhood || "all"}-${cuisine || "all"}`;
  const cached = cache.get(cacheKey);
  if (cached) return res.json({ restaurants: cached, cached: true });
  try {
    const { getAirtableRestaurants, syncRestaurantsToAirtable } = require("../services/airtable");
    const restaurants = await getAirtableRestaurants(neighborhood);
    const sorted = restaurants.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    cache.set(cacheKey, sorted);
    res.json({ restaurants: sorted, count: sorted.length });
    // Sync new restaurants from Google Places in background
    getPhillyRestaurants(neighborhood, cuisine).then(googleRestaurants => {
      syncRestaurantsToAirtable(googleRestaurants).catch(() => {});
    }).catch(() => {});
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch restaurants" });
  }
});

router.get("/neighborhoods", (req, res) => {
  res.json({ neighborhoods: PHILLY_NEIGHBORHOODS.map(n => n.name) });
});

// GET /api/restaurants/specials
router.get("/specials", async (req, res) => {
  const { getRestaurantSpecials } = require("../services/airtable");
  try {
    const specials = await getRestaurantSpecials();
    res.json({ specials });
  } catch (err) {
    console.error("Specials fetch error:", err);
    res.status(500).json({ error: "Failed to fetch specials" });
  }
});

// GET /api/restaurants/bars
router.get("/bars", async (req, res) => {
  const neighborhood = req.query.neighborhood || null;
  const cacheKey = `bars-${neighborhood || "all"}`;
  const cached = cache.get(cacheKey);
  if (cached) return res.json({ restaurants: cached, cached: true });
  try {
    const bars = await getPhillyBars(neighborhood);
    const sorted = bars.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    cache.set(cacheKey, sorted);
    res.json({ restaurants: sorted, count: sorted.length });
  } catch (err) { res.status(500).json({ error: "Failed to fetch bars" }); }
});

// GET /api/restaurants/nightclubs
router.get("/nightclubs", async (req, res) => {
  const neighborhood = req.query.neighborhood || null;
  const cacheKey = `nightclubs-${neighborhood || "all"}`;
  const cached = cache.get(cacheKey);
  if (cached) return res.json({ restaurants: cached, cached: true });
  try {
    const BLACKLIST = ["The Trestle Inn"];
    const clubs = await getPhillyNightclubs(neighborhood);
    const filtered = clubs.filter(c => !BLACKLIST.some(b => c.name.includes(b)));
    const sorted = filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    cache.set(cacheKey, sorted);
    res.json({ restaurants: sorted, count: sorted.length });
  } catch (err) { res.status(500).json({ error: "Failed to fetch nightclubs" }); }
});

// GET /api/restaurants/museums
router.get("/museums", async (req, res) => {
  const { getMuseums } = require("../services/airtable");
  const cacheKey = "museums";
  const cached = cache.get(cacheKey);
  if (cached) return res.json({ museums: cached, cached: true });
  try {
    const museums = await getMuseums();
    cache.set(cacheKey, museums);
    res.json({ museums });
  } catch (err) {
    console.error("Museums fetch error:", err);
    res.status(500).json({ error: "Failed to fetch museums" });
  }
});

// GET /api/restaurants/happyhours
router.get("/happyhours", async (req, res) => {
  const { getHappyHours } = require("../services/airtable");
  const cacheKey = "happyhours";
  const cached = cache.get(cacheKey);
  if (cached) return res.json({ happyHours: cached, cached: true });
  try {
    const happyHours = await getHappyHours();
    cache.set(cacheKey, happyHours);
    res.json({ happyHours });
  } catch (err) {
    console.error("Happy hours fetch error:", err);
    res.status(500).json({ error: "Failed to fetch happy hours" });
  }
});

router.get("/:id", async (req, res) => {
  const placeId = req.params.id;
  const cacheKey = `restaurant-detail-${placeId}`;
  const cached = cache.get(cacheKey);
  if (cached) return res.json({ restaurant: cached, cached: true });
  try {
    const restaurant = await getRestaurantDetails(placeId);
    if (!restaurant) return res.status(404).json({ error: "Restaurant not found" });
    cache.set(cacheKey, restaurant);
    res.json({ restaurant });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch restaurant details" });
  }
});

// GET /api/restaurants/sync - one time sync to populate Place IDs and images
router.get("/sync", async (req, res) => {
  try {
    const { getAirtableRestaurants } = require("../services/airtable");
    const restaurants = await getAirtableRestaurants(null);
    const needsSync = restaurants.filter(r => !r.placeId);
    
    let updated = 0;
    for (const r of needsSync) {
      try {
        const searchRes = await axios.get(
          "https://maps.googleapis.com/maps/api/place/findplacefromtext/json",
          { params: { input: `${r.name} Philadelphia PA`, inputtype: "textquery", fields: "place_id,name,formatted_address,rating,price_level,photos,formatted_phone_number,website", key: process.env.GOOGLE_PLACES_API_KEY } }
        );
        const candidate = searchRes.data.candidates && searchRes.data.candidates[0];
        if (!candidate) continue;
        
        const photoRef = candidate.photos && candidate.photos[0] && candidate.photos[0].photo_reference;
        const photoUrl = photoRef ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=${photoRef}&key=${process.env.GOOGLE_PLACES_API_KEY}` : null;
        
        // Update Airtable record
        const airtableId = r.id.replace("at-rest-", "");
        await axios.patch(
          `https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/Restaurants/${airtableId}`,
          { fields: {
            "Place ID": candidate.place_id,
            "Address": candidate.formatted_address || r.address,
            "Rating": candidate.rating || null,
            "Phone": candidate.formatted_phone_number || null,
            "Website": candidate.website || null,
            "Image": photoUrl,
          }},
          { headers: { Authorization: `Bearer ${process.env.AIRTABLE_API_KEY}`, "Content-Type": "application/json" } }
        );
        updated++;
        await new Promise(resolve => setTimeout(resolve, 200));
      } catch (e) {
        console.error("Sync error for", r.name, e.message);
      }
    }
    res.json({ message: `Synced ${updated} restaurants` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
