const express = require("express");
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
    const restaurants = await getPhillyRestaurants(neighborhood, cuisine);
    const sorted = restaurants.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    cache.set(cacheKey, sorted);
    res.json({ restaurants: sorted, count: sorted.length });
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
    const clubs = await getPhillyNightclubs(neighborhood);
    const sorted = clubs.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    cache.set(cacheKey, sorted);
    res.json({ restaurants: sorted, count: sorted.length });
  } catch (err) { res.status(500).json({ error: "Failed to fetch nightclubs" }); }
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

module.exports = router;
