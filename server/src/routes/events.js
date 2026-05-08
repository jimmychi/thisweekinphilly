const express = require("express");
const NodeCache = require("node-cache");
const { getTicketmasterEvents, getTicketmasterEventById } = require("../services/ticketmaster");
const { getPredicthqEvents } = require("../services/predicthq");
const { submitEvent, getApprovedEvents, syncEventsToAirtable } = require("../services/airtable");
const { generateEventDescription } = require("../services/claude");

const router = express.Router();
const cache = new NodeCache({ stdTTL: 3600 });

const VALID_CATEGORIES = ["concerts", "sports", "arts", "nightlife", "community"];

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
const [tmEvents, phqEvents, atEvents] = await Promise.allSettled([
      getTicketmasterEvents(category, days),
      getPredicthqEvents(category, days),
      getApprovedEvents(),
    ]);

    const atEventsFiltered = (atEvents.status === "fulfilled" ? atEvents.value : []).filter(e => !category || e.category === category);
    const all = [
      ...(tmEvents.status === "fulfilled" ? tmEvents.value : []),
      ...(phqEvents.status === "fulfilled" ? phqEvents.value : []),
      ...atEventsFiltered,
    ];

    const seen = new Set();
    const deduped = all.filter((e) => {
      const key = `${e.title?.toLowerCase().trim()}-${e.date}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    deduped.sort((a, b) => {
      if (!a.date) return 1;
      if (!b.date) return -1;
      return new Date(a.date + "T" + (a.time || "00:00")) - new Date(b.date + "T" + (b.time || "00:00"));
    });

    cache.set(cacheKey, deduped);
    // Sync new events to Airtable in background
    const tmAndPhq = [
      ...(tmEvents.status === "fulfilled" ? tmEvents.value : []),
      ...(phqEvents.status === "fulfilled" ? phqEvents.value : []),
    ];
    syncEventsToAirtable(tmAndPhq).catch(err => console.error("Sync error:", err));
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
      { id: "nightlife", label: "Nightlife", emoji: "🌙" },
      { id: "community", label: "Community", emoji: "🤝" },
    ],
  });
});

// GET /api/events/:id
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  const cacheKey = `event-${id}`;
  // cache disabled for event detail to ensure fresh phone data

  try {
    let event = null;
    if (id.startsWith("tm-")) {
      const tmId = id.replace("tm-", "");
      event = await getTicketmasterEventById(tmId);
    } else if (id.startsWith("at-")) {
      // Try cache first
      const allCached = cache.get("events-all-7") || [];
      event = allCached.find((e) => e.id === id) || null;
      // Fallback to Airtable directly
      if (!event) {
        const { getApprovedEvents } = require("../services/airtable");
        const atEvents = await getApprovedEvents();
        event = atEvents.find((e) => e.id === id) || null;
      }
    } else {
      const allCached = cache.get("events-all-7") || [];
      event = allCached.find((e) => e.id === id) || null;
    }

    if (!event) return res.status(404).json({ error: "Event not found" });

    // Auto-generate description if missing
    if (!event.description) {
      const aiDesc = await generateEventDescription(event.title, event.category, event.venue, event.date);
      if (aiDesc) event.description = aiDesc;
    }
    cache.set(cacheKey, event);
    res.json({ event });
  } catch (err) {
    console.error("Event detail error:", err);
    res.status(500).json({ error: "Failed to fetch event" });
  }
});

// POST /api/events/submit
router.post("/submit", async (req, res) => {
  const { title, date, time, venue, description, url, email } = req.body;
  if (!title || !date) {
    return res.status(400).json({ error: "Event name and date are required" });
  }
  const result = await submitEvent({ title, date, time, venue, description, url, email });
  if (!result) return res.status(500).json({ error: "Failed to submit event" });
  res.json({ success: true, message: "Event submitted for review!" });
});

module.exports = router;