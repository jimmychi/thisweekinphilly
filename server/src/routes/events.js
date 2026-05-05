const express = require("express");
const NodeCache = require("node-cache");
const { getTicketmasterEvents } = require("../services/ticketmaster");
const { getEventbriteEvents } = require("../services/eventbrite");

const router = express.Router();
// Cache for 15 minutes
const cache = new NodeCache({ stdTTL: 900 });

const VALID_CATEGORIES = ["concerts", "sports", "arts", "food", "family", "nightlife", "community"];

// GET /api/events?category=concerts&days=7
router.get("/", async (req, res) => {
  const category = req.query.category || null;
  const days = Math.min(parseInt(req.query.days) || 7, 30);

  if (category && !VALID_CATEGORIES.includes(category)) {
    return res.status(400).json({ error: "Invalid category" });
  }

  const cacheKey = `events-${category || "all"}-${days}`;
  const cached = cache.get(cacheKey);
  if (cached) {
    return res.json({ events: cached, cached: true });
  }

  try {
    // Fetch from both sources in parallel
    const [tmEvents, ebEvents] = await Promise.allSettled([
      getTicketmasterEvents(category, days),
      getEventbriteEvents(category, days),
    ]);

    const all = [
      ...(tmEvents.status === "fulfilled" ? tmEvents.value : []),
      ...(ebEvents.status === "fulfilled" ? ebEvents.value : []),
    ];

    // Deduplicate by normalized title+date
    const seen = new Set();
    const deduped = all.filter((e) => {
      const key = `${e.title?.toLowerCase().trim()}-${e.date}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    // Sort by date
    deduped.sort((a, b) => {
      if (!a.date) return 1;
      if (!b.date) return -1;
      return new Date(a.date + "T" + (a.time || "00:00")) - new Date(b.date + "T" + (b.time || "00:00"));
    });

    cache.set(cacheKey, deduped);
    res.json({ events: deduped, cached: false, count: deduped.length });
  } catch (err) {
    console.error("Events fetch error:", err);
    res.status(500).json({ error: "Failed to fetch events" });
  }
});

// GET /api/events/categories
router.get("/categories", (req, res) => {
  res.json({
    categories: [
      { id: "all", label: "All Events", emoji: "🏙️" },
      { id: "concerts", label: "Concerts", emoji: "🎵" },
      { id: "sports", label: "Sports", emoji: "🏈" },
      { id: "arts", label: "Arts & Culture", emoji: "🎨" },
      { id: "food", label: "Food & Drink", emoji: "🍻" },
      { id: "family", label: "Family", emoji: "👨‍👩‍👧" },
      { id: "nightlife", label: "Nightlife", emoji: "🌙" },
      { id: "community", label: "Community", emoji: "🤝" },
    ],
  });
});

module.exports = router;
