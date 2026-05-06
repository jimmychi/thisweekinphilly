const axios = require("axios");

const API_KEY = process.env.GOOGLE_PLACES_API_KEY;

const PHILLY_NEIGHBORHOODS = [
  { name: "Old City", location: "39.9496,-75.1454" },
  { name: "Fishtown", location: "39.9734,-75.1270" },
  { name: "Center City", location: "39.9526,-75.1652" },
  { name: "South Philly", location: "39.9195,-75.1646" },
  { name: "Rittenhouse", location: "39.9494,-75.1723" },
  { name: "Northern Liberties", location: "39.9634,-75.1399" },
];

async function getPhillyRestaurants(neighborhood, cuisine) {
  if (!API_KEY) {
    console.warn("GOOGLE_PLACES_API_KEY not set");
    return [];
  }

  try {
    const location = neighborhood 
      ? PHILLY_NEIGHBORHOODS.find(n => n.name === neighborhood)?.location || "39.9526,-75.1652"
      : "39.9526,-75.1652";

    const [lat, lng] = location.split(",");

    const params = {
      location: location,
      radius: 1500,
      type: "restaurant",
      key: API_KEY,
    };

    if (cuisine) params.keyword = cuisine;

    const res = await axios.get(
      "https://maps.googleapis.com/maps/api/place/nearbysearch/json",
      { params }
    );

    const places = res.data.results || [];

    return places.map(function(p) {
      const photoRef = p.photos && p.photos[0] && p.photos[0].photo_reference;
      const photoUrl = photoRef 
        ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=${photoRef}&key=${API_KEY}`
        : null;

      return {
        id: p.place_id,
        name: p.name,
        rating: p.rating || null,
        reviewCount: p.user_ratings_total || 0,
        priceLevel: p.price_level || null,
        address: p.vicinity || "Philadelphia, PA",
        image: photoUrl,
        neighborhood: neighborhood || "Philadelphia",
        types: p.types || [],
        openNow: p.opening_hours && p.opening_hours.open_now,
        googleMapsUrl: `https://www.google.com/maps/place/?q=place_id:${p.place_id}`,
      };
    });
  } catch (err) {
    console.error("Google Places error:", err.message);
    return [];
  }
}

module.exports = { getPhillyRestaurants, PHILLY_NEIGHBORHOODS };
