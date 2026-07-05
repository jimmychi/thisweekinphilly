const express = require("express");
const axios = require("axios");
const cloudinary = require("cloudinary").v2;
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
async function uploadToCloudinary(googlePhotoUrl, folder) {
  try {
    const proxyConfig = getProxyConfig();
    const response = await axios.get(googlePhotoUrl, { 
      responseType: "arraybuffer", 
      ...proxyConfig,
      maxRedirects: 5
    });
    const base64 = Buffer.from(response.data).toString("base64");
    const dataUri = `data:image/jpeg;base64,${base64}`;
    const result = await cloudinary.uploader.upload(dataUri, { folder: folder || "thisweekinphilly", resource_type: "image" });
    return result.secure_url;
  } catch (e) {
    console.error("Cloudinary upload error:", e.message);
    return null;
  }
}
const urlModule = require("url");

function getProxyConfig() {
  if (!process.env.FIXIE_URL) return {};
  return {
    httpsAgent: new (require("https-proxy-agent").HttpsProxyAgent)(process.env.FIXIE_URL),
    proxy: false
  };
}
const NodeCache = require("node-cache");
const { getPhillyRestaurants, getPhillyBars, getPhillyNightclubs, getRestaurantDetails, PHILLY_NEIGHBORHOODS } = require("../services/restaurants");

const router = express.Router();
const cache = new NodeCache({ stdTTL: 3600 });
let isSyncing = false;

router.get("/", async (req, res) => {
  const neighborhood = req.query.neighborhood || null;
  const cuisine = req.query.cuisine || null;
  const cacheKey = `restaurants-${neighborhood || "all"}-${cuisine || "all"}`;
  const cached = cache.get(cacheKey);
  if (cached) return res.json({ restaurants: cached, cached: true });
  try {
    const { getAirtableRestaurants, syncRestaurantsToAirtable } = require("../services/airtable");
    const restaurants = await getAirtableRestaurants(neighborhood);
    const sorted = restaurants.sort((a, b) => a.name.localeCompare(b.name));
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
    const { getAirtableBars, syncBarsToAirtable } = require("../services/airtable");
    const bars = await getAirtableBars(neighborhood);
    const sorted = bars.sort((a, b) => a.name.localeCompare(b.name));
    cache.set(cacheKey, sorted);
    res.json({ restaurants: sorted, count: sorted.length });

  } catch (err) { res.status(500).json({ error: "Failed to fetch bars" }); }
});

// GET /api/restaurants/syncbars
router.get("/syncbars", async (req, res) => {
  try {
    const { getAirtableBars } = require("../services/airtable");
    const bars = await getAirtableBars(null);
    console.log("Total bars:", bars.length);
    const force = req.query.force === "true";
    const needsSync = force ? bars : bars.filter(r => !r.placeId);
    console.log("Needs sync:", needsSync.length, "force:", force);
    let updated = 0;
    for (const r of needsSync) {
      try {
        const searchRes = await axios.get(
          "https://maps.googleapis.com/maps/api/place/textsearch/json",
          { params: { query: `${r.name} bar Philadelphia PA`, key: process.env.GOOGLE_PLACES_API_KEY } }
        );
        const candidate = searchRes.data.results && searchRes.data.results[0];
        console.log("Bar:", r.name, "Status:", searchRes.data.status, "Candidate:", candidate?.name);
        if (!candidate) continue;
        const detailRes = await axios.get(
          "https://maps.googleapis.com/maps/api/place/details/json",
          { params: { place_id: candidate.place_id, fields: "formatted_phone_number,website,photos", key: process.env.GOOGLE_PLACES_API_KEY } }
        );
        const details = detailRes.data.result || {};
        const photoRef = details.photos?.[0]?.photo_reference || candidate.photos?.[0]?.photo_reference;
        const photoUrl = photoRef ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=${photoRef}&key=${process.env.GOOGLE_PLACES_API_KEY}` : null;
        const airtableId = r.id.replace("at-bar-rec", "rec");
        await axios.patch(
          `https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/Bars/${airtableId}`,
          { fields: {
            "Place ID": candidate.place_id,
            "Address": candidate.formatted_address || r.address,
            "Rating": candidate.rating || null,
            "Phone": details.formatted_phone_number || null,
            "Website": details.website ? details.website.split("?")[0].replace(/\/$/, "") : null,
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
    res.json({ message: `Synced ${updated} bars` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/restaurants/nightclubs
router.get("/nightclubs", async (req, res) => {
  const neighborhood = req.query.neighborhood || null;
  const cacheKey = `nightclubs-${neighborhood || "all"}`;
  const cached = cache.get(cacheKey);
  if (cached) return res.json({ restaurants: cached, cached: true });
  try {
    const { getAirtableNightclubs } = require("../services/airtable");
    const clubs = await getAirtableNightclubs(neighborhood);
    if (clubs.length > 0) {
      const sorted = clubs.sort((a, b) => a.name.localeCompare(b.name));
      cache.set(cacheKey, sorted);
      return res.json({ restaurants: sorted, count: sorted.length });
    }
    // Fallback to Google Places if Airtable is empty
    const BLACKLIST = ["The Trestle Inn"];
    const googleClubs = await getPhillyNightclubs(neighborhood);
    const filtered = googleClubs.filter(c => !BLACKLIST.some(b => c.name.includes(b)));
    const sorted = filtered.sort((a, b) => a.name.localeCompare(b.name));
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


// GET /api/restaurants/sync - one time sync to populate Place IDs and images
router.get("/sync", async (req, res) => {
  try {
    const { getAirtableRestaurants } = require("../services/airtable");
    const restaurants = await getAirtableRestaurants(null);
    console.log("Total restaurants:", restaurants.length, "Sample placeId:", restaurants[0]?.placeId);
    const force = req.query.force === "true";
    const needsSync = force ? restaurants : restaurants.filter(r => !r.placeId);
    console.log("Needs sync:", needsSync.length);
    
    let updated = 0;
    for (const r of needsSync) {
      try {
        const searchRes = await axios.get(
          "https://maps.googleapis.com/maps/api/place/textsearch/json",
          { params: { query: `${r.name} Philadelphia PA`, key: process.env.GOOGLE_PLACES_API_KEY } }
        );
        const candidate = searchRes.data.results && searchRes.data.results[0];
        if (!candidate) { console.log("No candidate for", r.name); continue; }

        // Get full details including phone and website
        const detailRes = await axios.get(
          "https://maps.googleapis.com/maps/api/place/details/json",
          { params: { place_id: candidate.place_id, fields: "formatted_phone_number,website,photos", key: process.env.GOOGLE_PLACES_API_KEY } }
        );
        const details = detailRes.data.result || {};
        
        const photoRef = details.photos?.[0]?.photo_reference || candidate.photos?.[0]?.photo_reference;
        const photoUrl = photoRef ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=${photoRef}&key=${process.env.GOOGLE_PLACES_API_KEY}` : null;
        
        // Update Airtable record
        const airtableId = r.id.replace("at-rest-rec", "rec");
        await axios.patch(
          `https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/Restaurants/${airtableId}`,
          { fields: {
            "Place ID": candidate.place_id,
            "Address": candidate.formatted_address || r.address,
            "Rating": candidate.rating || null,
            "Price Level": candidate.price_level ? "$".repeat(candidate.price_level) : null,
            "Phone": details.formatted_phone_number || null,
            "Website": details.website ? details.website.split("?")[0].replace(/\/$/, "") : null,
            "Image": photoUrl,
          }},
          { headers: { Authorization: `Bearer ${process.env.AIRTABLE_API_KEY}`, "Content-Type": "application/json" } }
        );
        updated++;
        console.log("Updated:", r.name);
        await new Promise(resolve => setTimeout(resolve, 200));
      } catch (e) {
        console.error("Sync error for", r.name, e.message, e.response?.data);
      }
    }
    res.json({ message: `Synced ${updated} restaurants` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// GET /api/restaurants/syncneighborhoods - one time sync to populate neighborhoods
router.get("/syncneighborhoods", async (req, res) => {
  const neighborhoods = {"Vernick Food & Drink": "Rittenhouse", "Lemon Hill": "Fairmount", "Butcher and Singer": "Center City", "Noord": "East Passyunk", "Monk's Cafe": "Center City", "Sabrina's Cafe": "Callowhill", "Wm. Mulherin's Sons": "Fishtown", "Vernick Fish": "Center City", "Oyster House": "Center City", "The Dandelion": "Rittenhouse", "Fogo de Ch\u00e3o Brazilian Steakhouse": "Center City", "Kanella": "Washington Square West", "Parc": "Rittenhouse", "The Capital Grille": "Center City", "Laser Wolf": "Fishtown", "Zahav": "Old City", "Barbuzzo": "Washington Square West", "Rex 1516": "South Street", "High Street on Market": "Old City", "Amada": "Old City", "Serpico": "Washington Square West", "El Vez": "Washington Square West", "Abe Fisher": "Rittenhouse", "HipCityVeg": "Center City", "Time": "Center City", "McGillin's Olde Ale House": "Center City", "Good Dog Bar": "Rittenhouse", "Laurel": "East Passyunk", "City Tap House Logan Square": "Center City", "Southwark": "South Philly", "Vetri Cucina": "Rittenhouse", "Fogo de Chao Brazilian Steakhouse": "Center City"};
  try {
    const { getAirtableRestaurants } = require("../services/airtable");
    const restaurants = await getAirtableRestaurants(null);
    let updated = 0;
    for (const r of restaurants) {
      const neighborhood = neighborhoods[r.name];
      if (!neighborhood) continue;
      const airtableId = r.id.replace("at-rest-rec", "rec");
      await axios.patch(
        `https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/Restaurants/${airtableId}`,
        { fields: { "Neighborhood": neighborhood } },
        { headers: { Authorization: `Bearer ${process.env.AIRTABLE_API_KEY}`, "Content-Type": "application/json" } }
      );
      updated++;
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    res.json({ message: `Updated ${updated} restaurant neighborhoods` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/restaurants/syncimages - sync only images for bars and restaurants
router.get("/syncimages", async (req, res) => {
  if (isSyncing) return res.status(429).json({ error: "Sync already running, please wait" });
  isSyncing = true;
  try {
    const type = req.query.type || "bars";
    const { getAirtableBars, getAirtableRestaurants } = require("../services/airtable");
    const items = type === "restaurants" ? await getAirtableRestaurants(null) : await getAirtableBars(null);
    const needsImage = items.filter(r => r.placeId && (!r.image || r.image.includes("maps.googleapis.com")));
    console.log(`Needs images (${type}):`, needsImage.length);
    let updated = 0;
    for (const r of needsImage) {
      try {
        const detailRes = await axios.get("https://maps.googleapis.com/maps/api/place/details/json", { params: { place_id: r.placeId, fields: "photos", key: process.env.GOOGLE_PLACES_API_KEY }, ...getProxyConfig() });
        const photos = detailRes.data.result?.photos || [];
        if (!photos.length) continue;
        const allPhotoRefs = photos.slice(0, 6).map(p => p.photo_reference).filter(Boolean);
        const cloudinaryUrls = [];
        for (const ref of allPhotoRefs) {
          const gUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=${ref}&key=${process.env.GOOGLE_PLACES_API_KEY}`;
          const cUrl = await uploadToCloudinary(gUrl, "thisweekinphilly");
          if (cUrl) cloudinaryUrls.push(cUrl);
        }
        if (!cloudinaryUrls.length) continue;
        const airtableId = type === "restaurants" ? r.id.replace("at-rest-rec", "rec") : r.id.replace("at-bar-rec", "rec");
        const table = type === "restaurants" ? "Restaurants" : "Bars";
        await axios.patch(`https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/${table}/${airtableId}`, { fields: { "Image": cloudinaryUrls[0], "Images": cloudinaryUrls.join(",") } }, { headers: { Authorization: `Bearer ${process.env.AIRTABLE_API_KEY}`, "Content-Type": "application/json" } });
        updated++;
        console.log("Updated images for:", r.name);
        await new Promise(resolve => setTimeout(resolve, 300));
      } catch (e) { console.error("Image sync error for", r.name, e.message, e.response?.data || e.stack || ""); }
    }
    res.json({ message: `Updated images for ${updated} ${type}` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    isSyncing = false;
  }
});
// GET /api/restaurants/syncnightclubs
router.get("/syncnightclubs", async (req, res) => {
  if (isSyncing) return res.status(429).json({ error: "Sync already running, please wait" });
  isSyncing = true;
  try {
    const { getAirtableNightclubs } = require("../services/airtable");
    const existing = await getAirtableNightclubs(null);
    const existingIds = new Set(existing.map(r => r.placeId).filter(Boolean));
    const googleClubs = await getPhillyNightclubs(null);
    let added = 0;
    for (const club of googleClubs) {
      if (existingIds.has(club.id)) continue;
      try {
        await axios.post(
          `https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/Nightclubs`,
          { fields: {
            "Name": club.name,
            "Address": club.address,
            "Neighborhood": club.neighborhood,
            "Rating": club.rating,
            "Price Level": club.priceLevel ? "$".repeat(club.priceLevel) : null,
            "Place ID": club.id,
            "Active": false,
          }},
          { headers: { Authorization: `Bearer ${process.env.AIRTABLE_API_KEY}`, "Content-Type": "application/json" } }
        );
        added++;
        console.log("Added nightclub:", club.name);
        await new Promise(resolve => setTimeout(resolve, 200));
      } catch (e) { console.error("Error adding nightclub:", club.name, e.message); }
    }
    res.json({ message: `Added ${added} nightclubs` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    isSyncing = false;
  }
});

// GET /api/restaurants/syncbardescriptions?limit=10
router.get("/syncbardescriptions", async (req, res) => {
  if (isSyncing) return res.status(429).json({ error: "Sync already running, please wait" });
  isSyncing = true;
  try {
    const { generateBarDescription } = require("../services/claude");
    const { getAirtableBars } = require("../services/airtable");
    const limit = parseInt(req.query.limit) || 10;
    
    const bars = await getAirtableBars(null);
    const needsDesc = bars.filter(b => !b.description).slice(0, limit);
    console.log(`Bars needing descriptions: ${bars.filter(b => !b.description).length}, processing: ${needsDesc.length}`);
    
    let updated = 0;
    for (const bar of needsDesc) {
      try {
        const desc = await generateBarDescription(bar.name, bar.neighborhood, bar.specials, bar.rating);
        if (!desc) continue;
        const airtableId = bar.id.replace("at-bar-rec", "rec");
        await axios.patch(
          `https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/Bars/${airtableId}`,
          { fields: { "Description": desc } },
          { headers: { Authorization: `Bearer ${process.env.AIRTABLE_API_KEY}`, "Content-Type": "application/json" } }
        );
        updated++;
        console.log(`Updated description for: ${bar.name}`);
        await new Promise(r => setTimeout(r, 300));
      } catch (e) {
        console.error(`Description error for ${bar.name}:`, e.message);
      }
    }
    res.json({ message: `Updated descriptions for ${updated} bars`, remaining: bars.filter(b => !b.description).length - updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    isSyncing = false;
  }
});


// GET /api/restaurants/syncmuseums
router.get("/syncmuseums", async (req, res) => {
  if (isSyncing) return res.status(429).json({ error: "Sync already running, please wait" });
  isSyncing = true;
  try {
    const { getMuseums } = require("../services/airtable");
    const museums = await getMuseums();
    const force = req.query.force === "true";
    let updated = 0;
    for (const m of museums) {
      if (m.image && !m.image.includes("dvw6yky0c") && !force) continue;
      try {
        // Search by name + Philadelphia
        const searchRes = await axios.get("https://maps.googleapis.com/maps/api/place/findplacefromtext/json", {
          params: {
            input: `${m.name} Philadelphia`,
            inputtype: "textquery",
            fields: "place_id",
            key: process.env.GOOGLE_PLACES_API_KEY
          },
          ...getProxyConfig()
        });
        const placeId = searchRes.data.candidates?.[0]?.place_id;
        if (!placeId) { console.log("No place found for:", m.name); continue; }

        // Get photos using place ID
        const detailRes = await axios.get("https://maps.googleapis.com/maps/api/place/details/json", {
          params: { place_id: placeId, fields: "photos", key: process.env.GOOGLE_PLACES_API_KEY },
          ...getProxyConfig()
        });
        const photos = detailRes.data.result?.photos || [];
        if (!photos.length) { console.log("No photos for:", m.name); continue; }
        const photoRef = photos[0].photo_reference;
        const gUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=${photoRef}&key=${process.env.GOOGLE_PLACES_API_KEY}`;
        const cUrl = await uploadToCloudinary(gUrl, "thisweekinphilly");
        if (!cUrl) continue;
        const airtableId = m.id.replace("museum-rec", "rec");
        await axios.patch(
          `https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/Museums/${airtableId}`,
          { fields: { "Image": cUrl } },
          { headers: { Authorization: `Bearer ${process.env.AIRTABLE_API_KEY}`, "Content-Type": "application/json" } }
        );
        updated++;
        console.log("Updated museum image for:", m.name);
        await new Promise(r => setTimeout(r, 500));
      } catch (e) {
        console.error("Museum sync error for", m.name, e.message);
      }
    }
    res.json({ message: `Updated images for ${updated} museums` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    isSyncing = false;
  }
});

router.get("/:id", async (req, res) => {
  const id = req.params.id;
  const cacheKey = `restaurant-detail-${id}`;
  const cached = cache.get(cacheKey);
  if (cached) return res.json({ restaurant: cached, cached: true });
  try {
    let restaurant = null;
    if (id.startsWith("at-rest-") || id.startsWith("at-bar-")) {
      const { getAirtableRestaurants, getAirtableBars } = require("../services/airtable");
      const isBar = id.startsWith("at-bar-");
      const all = isBar ? await getAirtableBars(null) : await getAirtableRestaurants(null);
      const atRest = all.find(r => r.id === id);
      if (!atRest) return res.status(404).json({ error: "Restaurant not found" });
      if (atRest.placeId && !atRest.image) {
        const googleData = await getRestaurantDetails(atRest.placeId);
        restaurant = { ...googleData, ...atRest, name: atRest.name || googleData?.name, description: atRest.description || googleData?.description || null, address: atRest.address !== "Philadelphia, PA" ? atRest.address : googleData?.address || atRest.address, photos: googleData?.photos || [], reviews: googleData?.reviews || [], hours: googleData?.hours || null };
      } else {
        let googleDesc = null;
        if (atRest.placeId && !atRest.description) {
          try {
            const descRes = await axios.get("https://maps.googleapis.com/maps/api/place/details/json", { params: { place_id: atRest.placeId, fields: "editorial_summary", key: process.env.GOOGLE_PLACES_API_KEY }, ...getProxyConfig() });
            googleDesc = descRes.data.result?.editorial_summary?.overview || null;
          } catch (e) {}
        }
        restaurant = { ...atRest, description: atRest.description || googleDesc, photos: atRest.images && atRest.images.length > 0 ? atRest.images : atRest.image ? [atRest.image] : [] };
      }
    } else {
      restaurant = await getRestaurantDetails(id);
    }
    if (!restaurant) return res.status(404).json({ error: "Restaurant not found" });
    cache.set(cacheKey, restaurant);
    res.json({ restaurant });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch restaurant details" });
  }
});


module.exports = router;

