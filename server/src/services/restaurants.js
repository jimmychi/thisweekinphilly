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
  if (!API_KEY) return [];

  try {
    const location = neighborhood
      ? PHILLY_NEIGHBORHOODS.find(n => n.name === neighborhood)?.location || "39.9526,-75.1652"
      : "39.9526,-75.1652";

    const params = {
      location,
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
    return places.map(p => {
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

async function getRestaurantDetails(placeId) {
  if (!API_KEY) return null;

  try {
    const res = await axios.get(
      "https://maps.googleapis.com/maps/api/place/details/json",
      {
        params: {
          place_id: placeId,
          fields: "name,rating,user_ratings_total,price_level,formatted_address,formatted_phone_number,website,opening_hours,photos,editorial_summary,reviews,types,url",
          key: API_KEY,
        }
      }
    );

    const p = res.data.result;
    if (!p) return null;

    const photos = (p.photos || []).slice(0, 6).map(photo =>
      `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=${photo.photo_reference}&key=${API_KEY}`
    );

    const reviews = (p.reviews || []).slice(0, 3).map(r => ({
      author: r.author_name,
      rating: r.rating,
      text: r.text,
      time: r.relative_time_description,
      avatar: r.profile_photo_url,
    }));

    return {
      id: placeId,
      name: p.name,
      rating: p.rating || null,
      reviewCount: p.user_ratings_total || 0,
      priceLevel: p.price_level || null,
      address: (p.formatted_address || "Philadelphia, PA").replace(/, USA$/, "").replace(/,$/, "").trim(),
      phone: p.formatted_phone_number || null,
      website: p.website ? p.website.split("?")[0].replace(/\/$/, "") : null,
      description: p.editorial_summary?.overview || null,
      hours: p.opening_hours?.weekday_text || null,
      openNow: p.opening_hours?.open_now,
      photos,
      reviews,
      types: p.types || [],
      googleMapsUrl: p.url || `https://www.google.com/maps/place/?q=place_id:${placeId}`,
    };
  } catch (err) {
    console.error("Google Place Details error:", err.message);
    return null;
  }
}


async function getPhillyBars(neighborhood) {
  if (!API_KEY) return [];
  try {
    const location = neighborhood
      ? PHILLY_NEIGHBORHOODS.find(n => n.name === neighborhood)?.location || "39.9526,-75.1652"
      : "39.9526,-75.1652";
    const params = { location, radius: 2000, type: "bar", key: API_KEY };
    const res = await axios.get("https://maps.googleapis.com/maps/api/place/nearbysearch/json", { params });
    const places = (res.data.results || []).filter(p => {
      const types = p.types || [];
      return !types.includes("restaurant") && !types.includes("meal_delivery") && !types.includes("meal_takeaway");
    });
    return places.map(p => {
      const photoRef = p.photos && p.photos[0] && p.photos[0].photo_reference;
      const photoUrl = photoRef ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=${photoRef}&key=${API_KEY}` : null;
      return {
        id: p.place_id, name: p.name, rating: p.rating || null,
        reviewCount: p.user_ratings_total || 0, priceLevel: p.price_level || null,
        address: p.vicinity || "Philadelphia, PA", image: photoUrl,
        neighborhood: neighborhood || "Philadelphia", types: p.types || [],
        openNow: p.opening_hours && p.opening_hours.open_now,
        googleMapsUrl: `https://www.google.com/maps/place/?q=place_id:${p.place_id}`,
      };
    });
  } catch (err) { console.error("Google Places bars error:", err.message); return []; }
}

async function getPhillyNightclubs(neighborhood) {
  if (!API_KEY) return [];
  try {
    const location = neighborhood
      ? PHILLY_NEIGHBORHOODS.find(n => n.name === neighborhood)?.location || "39.9526,-75.1652"
      : "39.9526,-75.1652";
    const params = { location, radius: 2000, type: "night_club", key: API_KEY };
    const res = await axios.get("https://maps.googleapis.com/maps/api/place/nearbysearch/json", { params });
    const places = res.data.results || [];
    return places.map(p => {
      const photoRef = p.photos && p.photos[0] && p.photos[0].photo_reference;
      const photoUrl = photoRef ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=${photoRef}&key=${API_KEY}` : null;
      return {
        id: p.place_id, name: p.name, rating: p.rating || null,
        reviewCount: p.user_ratings_total || 0, priceLevel: p.price_level || null,
        address: p.vicinity || "Philadelphia, PA", image: photoUrl,
        neighborhood: neighborhood || "Philadelphia", types: p.types || [],
        openNow: p.opening_hours && p.opening_hours.open_now,
        googleMapsUrl: `https://www.google.com/maps/place/?q=place_id:${p.place_id}`,
      };
    });
  } catch (err) { console.error("Google Places nightclubs error:", err.message); return []; }
}

module.exports = { getPhillyRestaurants, getPhillyBars, getPhillyNightclubs, getRestaurantDetails, PHILLY_NEIGHBORHOODS };
