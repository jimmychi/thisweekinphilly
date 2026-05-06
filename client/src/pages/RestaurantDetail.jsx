import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_URL || "https://thisweekinphilly-api.onrender.com/api";

const PRICE = { 1: "$", 2: "$$", 3: "$$$", 4: "$$$$" };
const PRICE_LABEL = { 1: "Inexpensive", 2: "Moderate", 3: "Pricey", 4: "Fine Dining" };

const styles = {
  page: { minHeight: "100vh", background: "var(--cream)" },
  back: {
    display: "inline-flex", alignItems: "center", gap: 6,
    padding: "10px 20px", margin: "24px",
    background: "var(--ink)", color: "var(--cream)",
    borderRadius: 999, border: "none", cursor: "pointer",
    fontFamily: "var(--font-body)", fontSize: "0.85rem",
    textDecoration: "none",
  },
  hero: {
    width: "100%", height: 320,
    objectFit: "cover",
    display: "block",
  },
  heroPlaceholder: {
    width: "100%", height: 320,
    background: "var(--parchment)",
    display: "flex", alignItems: "center",
    justifyContent: "center", fontSize: "4rem",
  },
  content: {
    maxWidth: 800, margin: "0 auto", padding: "32px 24px",
  },
  name: {
    fontFamily: "var(--font-display)",
    fontSize: "clamp(1.8rem, 4vw, 2.8rem)",
    fontWeight: 900, color: "var(--ink)",
    marginBottom: 12,
  },
  metaRow: {
    display: "flex", gap: 12, alignItems: "center",
    flexWrap: "wrap", marginBottom: 20,
  },
  rating: {
    background: "var(--brass)", color: "#fff",
    borderRadius: 6, padding: "4px 10px",
    fontSize: "0.9rem", fontWeight: 700,
  },
  price: {
    color: "var(--brick)", fontWeight: 700, fontSize: "1rem",
  },
  openNow: {
    color: "#2e7d32", fontWeight: 600, fontSize: "0.9rem",
  },
  closed: {
    color: "#c62828", fontWeight: 600, fontSize: "0.9rem",
  },
  reviews: {
    color: "var(--stone-dark)", fontSize: "0.85rem",
  },
  infoBox: {
    background: "var(--parchment)",
    borderRadius: 12, padding: "20px 24px",
    marginBottom: 24,
  },
  infoRow: {
    display: "flex", gap: 12,
    padding: "10px 0",
    borderBottom: "1px solid var(--stone)",
    alignItems: "flex-start",
  },
  infoLabel: {
    fontFamily: "var(--font-body)",
    fontWeight: 700, color: "var(--stone-dark)",
    fontSize: "0.85rem", minWidth: 80,
  },
  infoValue: {
    fontFamily: "var(--font-body)",
    color: "var(--ink)", fontSize: "0.95rem",
  },
  cta: {
    display: "block", width: "100%",
    padding: "16px", borderRadius: 12,
    background: "var(--brick)", color: "#fff",
    fontFamily: "var(--font-display)",
    fontSize: "1rem", fontWeight: 700,
    border: "none", cursor: "pointer",
    textAlign: "center", textDecoration: "none",
    marginTop: 8,
  },
};

export default function RestaurantDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch all restaurants and find the one with matching id
    fetch(`${API_BASE}/restaurants`)
      .then(r => r.json())
      .then(data => {
        const found = (data.restaurants || []).find(r => r.id === id);
        setRestaurant(found || null);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) return <div style={{ padding: 48, textAlign: "center", fontFamily: "var(--font-body)" }}>Loading...</div>;
  if (!restaurant) return <div style={{ padding: 48, textAlign: "center", fontFamily: "var(--font-body)" }}>Restaurant not found.</div>;

  return (
    <div style={styles.page}>
      <button style={styles.back} onClick={() => navigate("/restaurants")}>← Back to Restaurants</button>

      {restaurant.image ? (
        <img src={restaurant.image} alt={restaurant.name} style={styles.hero} />
      ) : (
        <div style={styles.heroPlaceholder}>🍽️</div>
      )}

      <div style={styles.content}>
        <h1 style={styles.name}>{restaurant.name}</h1>

        <div style={styles.metaRow}>
          {restaurant.rating && <span style={styles.rating}>⭐ {restaurant.rating}</span>}
          {restaurant.priceLevel && <span style={styles.price}>{PRICE[restaurant.priceLevel]} · {PRICE_LABEL[restaurant.priceLevel]}</span>}
          {restaurant.openNow !== undefined && (
            <span style={restaurant.openNow ? styles.openNow : styles.closed}>
              {restaurant.openNow ? "● Open Now" : "● Closed"}
            </span>
          )}
          {restaurant.reviewCount > 0 && (
            <span style={styles.reviews}>{restaurant.reviewCount.toLocaleString()} reviews</span>
          )}
        </div>

        <div style={styles.infoBox}>
          <div style={styles.infoRow}>
            <span style={styles.infoLabel}>📍 Address</span>
            <span style={styles.infoValue}>{restaurant.address}</span>
          </div>
          <div style={styles.infoRow}>
            <span style={styles.infoLabel}>🏘️ Area</span>
            <span style={styles.infoValue}>{restaurant.neighborhood}</span>
          </div>
          {restaurant.priceLevel && (
            <div style={styles.infoRow}>
              <span style={styles.infoLabel}>💰 Price</span>
              <span style={styles.infoValue}>{PRICE[restaurant.priceLevel]} — {PRICE_LABEL[restaurant.priceLevel]}</span>
            </div>
          )}
        </div>

        <a href={restaurant.googleMapsUrl} target="_blank" rel="noopener noreferrer" style={styles.cta}>
          View on Google Maps & Get Directions
        </a>
      </div>
    </div>
  );
}
