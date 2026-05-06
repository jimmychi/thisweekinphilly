import React, { useState, useEffect } from "react";
import Header from "../components/Header.jsx";
import { useNavigate } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_URL || "https://thisweekinphilly-api.onrender.com/api";

const NEIGHBORHOODS = ["All", "Center City", "Old City", "Fishtown", "Rittenhouse", "South Philly", "Northern Liberties"];

const PRICE = { 1: "$", 2: "$$", 3: "$$$", 4: "$$$$" };

const styles = {
  page: { minHeight: "100vh", background: "var(--cream)" },
  header: {
    background: "var(--ink)",
    backgroundImage: `radial-gradient(ellipse at 20% 50%, rgba(184,76,43,0.15) 0%, transparent 60%)`,
    padding: "48px 24px 40px",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
  },
  headerInner: { maxWidth: 1200, margin: "0 auto" },
  headline: {
    fontFamily: "var(--font-display)",
    fontSize: "clamp(2rem, 5vw, 3rem)",
    fontWeight: 900,
    color: "var(--cream)",
    marginBottom: 8,
  },
  accent: { color: "var(--brick)" },
  sub: { fontFamily: "var(--font-body)", fontStyle: "italic", fontSize: "1rem", color: "var(--stone-light)" },
  filters: {
    background: "var(--parchment)",
    borderBottom: "1px solid var(--stone)",
    padding: "16px 24px",
    display: "flex",
    gap: 8,
    flexWrap: "wrap",
    justifyContent: "center",
  },
  pill: (active) => ({
    padding: "8px 18px",
    borderRadius: 999,
    border: active ? "none" : "1px solid var(--stone)",
    background: active ? "var(--brick)" : "transparent",
    color: active ? "#fff" : "var(--ink)",
    fontFamily: "var(--font-body)",
    fontSize: "0.85rem",
    fontWeight: active ? 700 : 400,
    cursor: "pointer",
  }),
  grid: {
    maxWidth: 1200,
    margin: "0 auto",
    padding: "32px 24px",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
    gap: 24,
  },
  card: {
    background: "#fff",
    borderRadius: 12,
    overflow: "hidden",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
    transition: "transform 0.2s, box-shadow 0.2s",
    cursor: "pointer",
    textDecoration: "none",
    display: "block",
    color: "inherit",
  },
  cardImg: {
    width: "100%",
    height: 180,
    objectFit: "cover",
    background: "var(--stone)",
  },
  cardImgPlaceholder: {
    width: "100%",
    height: 180,
    background: "var(--parchment)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "2rem",
  },
  cardBody: { padding: "16px" },
  cardName: {
    fontFamily: "var(--font-display)",
    fontSize: "1.1rem",
    fontWeight: 700,
    color: "var(--ink)",
    marginBottom: 4,
  },
  cardMeta: {
    display: "flex",
    gap: 8,
    alignItems: "center",
    marginBottom: 6,
    flexWrap: "wrap",
  },
  rating: {
    background: "var(--brass)",
    color: "#fff",
    borderRadius: 4,
    padding: "2px 7px",
    fontSize: "0.8rem",
    fontWeight: 700,
  },
  price: {
    color: "var(--brick)",
    fontWeight: 700,
    fontSize: "0.85rem",
  },
  openNow: {
    color: "#2e7d32",
    fontSize: "0.78rem",
    fontWeight: 600,
  },
  address: {
    fontSize: "0.82rem",
    color: "var(--stone-dark)",
    fontFamily: "var(--font-body)",
  },
  loading: {
    textAlign: "center",
    padding: "80px 24px",
    fontFamily: "var(--font-body)",
    color: "var(--stone-dark)",
    fontSize: "1.1rem",
  },
};

export default function Restaurants() {
  const navigate = useNavigate();
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [neighborhood, setNeighborhood] = useState("All");

  useEffect(() => {
    setLoading(true);
    const n = neighborhood === "All" ? "" : `?neighborhood=${encodeURIComponent(neighborhood)}`;
    fetch(`${API_BASE}/restaurants${n}`)
      .then(r => r.json())
      .then(data => {
        setRestaurants(data.restaurants || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [neighborhood]);

  return (
    <div style={styles.page}>
      <Header />
      <div style={styles.header}>
        <div style={styles.headerInner}>
          <h1 style={styles.headline}>
            Philly <span style={styles.accent}>Restaurants</span>
          </h1>
          <p style={styles.sub}>Top-rated dining across Philadelphia neighborhoods</p>
        </div>
      </div>

      <div style={styles.filters}>
        {NEIGHBORHOODS.map(n => (
          <button key={n} style={styles.pill(n === neighborhood)} onClick={() => setNeighborhood(n)}>
            {n}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={styles.loading}>Loading restaurants...</div>
      ) : (
        <div style={styles.grid}>
          {restaurants.map(r => (
            <div key={r.id} style={{...styles.card, cursor: "pointer"}} onClick={() => navigate(`/restaurants/${encodeURIComponent(r.id)}`)}>  
              {r.image ? (
                <img src={r.image} alt={r.name} style={styles.cardImg} />
              ) : (
                <div style={styles.cardImgPlaceholder}>🍽️</div>
              )}
              <div style={styles.cardBody}>
                <div style={styles.cardName}>{r.name}</div>
                <div style={styles.cardMeta}>
                  {r.rating && <span style={styles.rating}>⭐ {r.rating}</span>}
                  {r.priceLevel && <span style={styles.price}>{PRICE[r.priceLevel]}</span>}
                  {r.openNow && <span style={styles.openNow}>● Open Now</span>}
                </div>
                <div style={styles.address}>{r.address}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
