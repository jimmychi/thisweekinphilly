import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../components/Header.jsx";

const API_BASE = import.meta.env.VITE_API_URL || "https://thisweekinphilly-api.onrender.com/api";
const PRICE = { 1: "$", 2: "$$", 3: "$$$", 4: "$$$$" };
const PRICE_LABEL = { 1: "Inexpensive", 2: "Moderate", 3: "Pricey", 4: "Fine Dining" };
const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const styles = {
  page: { minHeight: "100vh", background: "var(--cream)" },
  photoGrid: {
    display: "grid",
    gridTemplateColumns: "2fr 1fr 1fr",
    gridTemplateRows: "200px 200px",
    gap: 4,
    maxHeight: 404,
    overflow: "hidden",
  },
  photoGridMobile: {
    width: "100%",
    height: 220,
    overflow: "hidden",
  },
  photoMain: {
    gridRow: "1 / 3",
    width: "100%", height: "100%",
    objectFit: "cover",
  },
  photoThumb: {
    width: "100%", height: "100%",
    objectFit: "cover",
  },
  photoPlaceholder: {
    width: "100%", height: 320,
    background: "var(--parchment)",
    display: "flex", alignItems: "center",
    justifyContent: "center", fontSize: "4rem",
  },
  content: {
    maxWidth: 900, margin: "0 auto", padding: "32px 24px",
    display: "grid",
    gridTemplateColumns: "1fr 320px",
    gap: 32,
  },
  contentMobile: {
    maxWidth: 900, margin: "0 auto", padding: "32px 24px",
  },
  name: {
    fontFamily: "var(--font-display)",
    fontSize: "clamp(1.8rem, 4vw, 2.8rem)",
    fontWeight: 900, color: "var(--ink)",
    marginBottom: 12,
  },
  metaRow: {
    display: "flex", gap: 10, alignItems: "center",
    flexWrap: "wrap", marginBottom: 16,
  },
  rating: {
    background: "var(--brass)", color: "#fff",
    borderRadius: 6, padding: "4px 10px",
    fontSize: "0.9rem", fontWeight: 700,
  },
  price: { color: "var(--brick)", fontWeight: 700, fontSize: "1rem" },
  openNow: { color: "#2e7d32", fontWeight: 600, fontSize: "0.9rem" },
  closed: { color: "#c62828", fontWeight: 600, fontSize: "0.9rem" },
  reviews: { color: "var(--stone-dark)", fontSize: "0.85rem" },
  description: {
    fontFamily: "var(--font-body)",
    fontSize: "1rem", lineHeight: 1.7,
    color: "var(--ink)", marginBottom: 24,
    fontStyle: "normal",

  },
  sectionTitle: {
    fontFamily: "var(--font-display)",
    fontSize: "1.2rem", fontWeight: 700,
    color: "var(--ink)", marginBottom: 12,
    marginTop: 24,
  },
  infoBox: {
    background: "var(--parchment)",
    borderRadius: 12, padding: "20px",
    marginBottom: 16,
  },
  infoRow: {
    display: "flex", gap: 12,
    padding: "8px 0",
    borderBottom: "1px solid var(--stone)",
    alignItems: "flex-start",
  },
  infoLabel: {
    fontFamily: "var(--font-body)",
    fontWeight: 700, color: "var(--stone-dark)",
    fontSize: "0.82rem", minWidth: 24,
  },
  infoValue: {
    fontFamily: "var(--font-body)",
    color: "var(--ink)", fontSize: "0.9rem",
  },
  hoursGrid: {
    display: "grid", gridTemplateColumns: "1fr",
    gap: 4,
  },
  hourRow: {
    display: "flex", justifyContent: "space-between",
    fontFamily: "var(--font-body)", fontSize: "0.85rem",
    padding: "4px 0",
    borderBottom: "1px solid rgba(0,0,0,0.05)",
  },
  reviewCard: {
    background: "#fff",
    borderRadius: 10, padding: "16px",
    marginBottom: 12,
    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
  },
  reviewHeader: {
    display: "flex", alignItems: "center", gap: 10, marginBottom: 8,
  },
  reviewAvatar: {
    width: 36, height: 36, borderRadius: "50%",
    objectFit: "cover",
  },
  reviewAuthor: {
    fontFamily: "var(--font-body)", fontWeight: 700,
    fontSize: "0.9rem", color: "var(--ink)",
  },
  reviewTime: {
    fontFamily: "var(--font-body)", fontSize: "0.75rem",
    color: "var(--stone-dark)",
  },
  reviewText: {
    fontFamily: "var(--font-body)", fontSize: "0.88rem",
    color: "var(--ink)", lineHeight: 1.6,
  },
  stars: { color: "var(--brass)", fontSize: "0.85rem" },
  cta: {
    display: "block", width: "100%",
    padding: "14px", borderRadius: 10,
    background: "var(--brick)", color: "#fff",
    fontFamily: "var(--font-display)",
    fontSize: "0.95rem", fontWeight: 700,
    border: "none", cursor: "pointer",
    textAlign: "center", textDecoration: "none",
    marginBottom: 10,
  },
  ctaSecondary: {
    display: "block", width: "100%",
    padding: "14px", borderRadius: 10,
    background: "transparent",
    color: "var(--ink)",
    fontFamily: "var(--font-display)",
    fontSize: "0.95rem", fontWeight: 700,
    border: "2px solid var(--stone)",
    cursor: "pointer",
    textAlign: "center", textDecoration: "none",
    marginBottom: 10,
  },
  loading: {
    textAlign: "center", padding: "80px 24px",
    fontFamily: "var(--font-body)", color: "var(--stone-dark)",
    fontSize: "1.1rem",
  },
};

function StarRating({ rating }) {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  return (
    <span style={styles.stars}>
      {"★".repeat(full)}{half ? "½" : ""}{"☆".repeat(5 - full - (half ? 1 : 0))}
      {" "}{rating}
    </span>
  );
}

export default function RestaurantDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [airtableData, setAirtableData] = useState(null);
  const isMobile = window.innerWidth < 768;

  useEffect(() => {
    fetch(`${API_BASE}/restaurants/${encodeURIComponent(id)}`)
      .then(r => r.json())
      .then(data => {
        const rest = data.restaurant || null;
        setRestaurant(rest);
        setLoading(false);
        if (rest) {
          fetch(`${API_BASE}/restaurants/specials`)
            .then(r => r.json())
            .then(sd => {
              if (sd.specials) {
                const match = sd.specials.find(s =>
                  s.name.toLowerCase().trim() === rest.name.toLowerCase().trim()
                );
                if (match) setAirtableData(match);
              }
            })
            .catch(() => {});
        }
      })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div style={styles.page}>
      <Header />
      <div style={styles.loading}>Loading restaurant details...</div>
    </div>
  );

  if (!restaurant) return (
    <div style={styles.page}>
      <Header />
      <div style={styles.loading}>Restaurant not found. <button onClick={() => navigate("/restaurants")}>Go back</button></div>
    </div>
  );

  const today = new Date().toLocaleDateString("en-US", { weekday: "long" });

  return (
    <div style={styles.page}>
      <Header />

      {/* Photo Grid */}
      {restaurant.photos && restaurant.photos.length > 0 ? (
        <div style={isMobile ? styles.photoGridMobile : styles.photoGrid}>
          <img src={restaurant.photos[0]} alt={restaurant.name} style={styles.photoMain} />
          {!isMobile && restaurant.photos.slice(1, 5).map((p, i) => (
            <img key={i} src={p} alt="" style={styles.photoThumb} />
          ))}
        </div>
      ) : (
        <div style={styles.photoPlaceholder}>🍽️</div>
      )}

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px 24px", display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 320px", gap: 32 }}>
        {/* Left Column */}
        <div>
          <h1 style={styles.name}>{restaurant.name}</h1>

          <div style={styles.metaRow}>
  
  
            {restaurant.priceLevel && <span style={styles.price}>{PRICE[restaurant.priceLevel]} · {PRICE_LABEL[restaurant.priceLevel]}</span>}
            {restaurant.openNow !== undefined && (
              <span style={restaurant.openNow ? styles.openNow : styles.closed}>
                {restaurant.openNow ? "● Open Now" : "● Closed"}
              </span>
            )}
          </div>

          {restaurant.description && (
            <p style={styles.description} dangerouslySetInnerHTML={{ __html: restaurant.description }} />
          )}
          {airtableData?.description && (
            <p style={styles.description} dangerouslySetInnerHTML={{ __html: airtableData.description }} />
          )}



        </div>

        {/* Right Column */}
        <div>
          <div style={styles.infoBox}>
            {restaurant.address && (
              <div style={styles.infoRow}>
                <div>
                  <div style={styles.infoValue}>{restaurant.address}</div>
                  <a href={restaurant.googleMapsUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: "0.85rem", color: "var(--brick)", textDecoration: "underline", fontFamily: "var(--font-body)" }}>Get Directions</a>
                </div>
              </div>
            )}
            {restaurant.phone && (
              <div style={styles.infoRow}>
                <span style={styles.infoValue}><a href={`tel:${restaurant.phone}`} style={{ color: "var(--brick)", textDecoration: "none" }}>{restaurant.phone}</a></span>
              </div>
            )}
            {restaurant.website && (
              <div style={styles.infoRow}>
                <span style={styles.infoValue}>
                  <a href={restaurant.website} target="_blank" rel="noopener noreferrer" style={{ color: "var(--brick)", textDecoration: "none" }}>
                    {restaurant.website.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                  </a>
                </span>
              </div>
            )}
          </div>


          {/* Hours */}
          {restaurant.hours && (
            <div style={styles.infoBox}>
              <div style={{ ...styles.sectionTitle, marginTop: 0 }}>Hours</div>
              <div style={styles.hoursGrid}>
                {restaurant.hours.map((h, i) => {
                  const isToday = h.startsWith(today);
                  return (
                    <div key={i} style={{ ...styles.hourRow, fontWeight: isToday ? 700 : 400, color: isToday ? "var(--brick)" : "var(--ink)" }}>
                      <span>{h.split(": ")[0]}</span>
                      <span>{h.split(": ")[1]}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}



          <button onClick={() => navigate("/restaurants")} style={{ ...styles.ctaSecondary, cursor: "pointer", border: "none", color: "var(--stone-dark)", fontSize: "0.85rem" }}>
            ← Back to Restaurants
          </button>
        </div>
      </div>
    </div>
  );
}
