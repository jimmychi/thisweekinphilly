import React, { useState, useEffect } from "react";
import Header from "../components/Header.jsx";

const API_BASE = import.meta.env.VITE_API_URL || "https://thisweekinphilly-api.onrender.com/api";
const NEIGHBORHOODS = ["All", "Center City", "Old City", "Fishtown", "Rittenhouse", "South Philly", "Northern Liberties", "Fairmount", "University City"];

const styles = {
  page: { minHeight: "100vh", background: "var(--cream)" },
  header: {
    background: "var(--ink)",
    backgroundImage: `radial-gradient(ellipse at 20% 50%, rgba(184,76,43,0.15) 0%, transparent 60%)`,
    padding: "24px 24px 20px",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
  },
  headerInner: { maxWidth: 1200, margin: "0 auto" },
  headline: { fontFamily: "var(--font-display)", fontSize: "clamp(2rem, 5vw, 3rem)", fontWeight: 900, color: "var(--cream)", marginBottom: 8 },
  accent: { color: "var(--brick)" },
  sub: { fontFamily: "var(--font-body)", fontStyle: "italic", fontSize: "1rem", color: "var(--stone-light)" },
  filters: { background: "var(--parchment)", borderBottom: "1px solid var(--stone)", padding: "16px 24px", display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center" },
  pill: (active) => ({ padding: "8px 18px", borderRadius: 999, border: active ? "none" : "1px solid var(--stone)", background: active ? "var(--brick)" : "transparent", color: active ? "#fff" : "var(--ink)", fontFamily: "var(--font-body)", fontSize: "0.85rem", fontWeight: active ? 700 : 400, cursor: "pointer" }),
  grid: { maxWidth: 1200, margin: "0 auto", padding: "32px 24px", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 24 },
  card: { background: "#fff", borderRadius: 12, overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" },
  cardImg: { width: "100%", height: 160, objectFit: "cover" },
  cardImgPlaceholder: { width: "100%", height: 160, background: "var(--parchment)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2rem" },
  cardBody: { padding: "16px" },
  cardName: { fontFamily: "var(--font-display)", fontSize: "1.1rem", fontWeight: 700, color: "var(--ink)", marginBottom: 6 },
  special: { fontFamily: "var(--font-body)", fontSize: "0.9rem", color: "var(--brick)", fontWeight: 600, marginBottom: 6 },
  dayTime: { fontFamily: "var(--font-body)", fontSize: "0.82rem", color: "var(--stone-dark)", marginBottom: 4 },
  neighborhood: { fontFamily: "var(--font-body)", fontSize: "0.78rem", color: "var(--stone)", textTransform: "uppercase", letterSpacing: "0.05em" },
  loading: { textAlign: "center", padding: "80px 24px", fontFamily: "var(--font-body)", color: "var(--stone-dark)", fontSize: "1.1rem" },
};

export default function HappyHours() {
  const [happyHours, setHappyHours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [neighborhood, setNeighborhood] = useState("All");

  useEffect(() => {
    fetch(`${API_BASE}/restaurants/happyhours`)
      .then(r => r.json())
      .then(data => { setHappyHours(data.happyHours || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = neighborhood === "All" ? happyHours : happyHours.filter(h => h.neighborhood === neighborhood);

  return (
    <div style={styles.page}>
      <Header />
      <div style={styles.header}>
        <div style={styles.headerInner}>
          <h1 style={styles.headline}>Philly <span style={styles.accent}>Happy Hours</span></h1>
          <p style={styles.sub}>The best drink deals across Philadelphia</p>
        </div>
      </div>
      <div style={styles.filters}>
        {NEIGHBORHOODS.map(n => (
          <button key={n} style={styles.pill(n === neighborhood)} onClick={() => setNeighborhood(n)}>{n}</button>
        ))}
      </div>
      {loading ? (
        <div style={styles.loading}>Loading happy hours...</div>
      ) : (
        <div style={styles.grid}>
          {filtered.map(h => (
            <div key={h.id} style={styles.card}>
              {h.image ? <img src={h.image} alt={h.name} style={styles.cardImg} /> : <div style={styles.cardImgPlaceholder}>🍺</div>}
              <div style={styles.cardBody}>
                <div style={styles.cardName}>{h.name}</div>
                <div style={styles.special}>{h.special}</div>
                <div style={styles.dayTime}>📅 {h.day}</div>
                <div style={styles.dayTime}>🕐 {h.time}</div>
                <div style={styles.neighborhood}>{h.neighborhood}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
