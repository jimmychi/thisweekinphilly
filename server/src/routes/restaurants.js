const express = require("express");
const NodeCache = require("node-cache");
const { getPhillyRestaurants, PHILLY_NEIGHBORHOODS } = require("../services/restaurants");

const router = express.Router();
const cache = new NodeCache({ stdTTL: 3600 }); // Cache 1 hour

// GET /api/restaurants
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

// GET /api/restaurants/neighborhoods
router.get("/neighborhoods", (req, res) => {
  res.json({ neighborhoods: PHILLY_NEIGHBORHOODS.map(n => n.name) });
});

module.exports = router;
