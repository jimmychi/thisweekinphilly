import React, { useState, useEffect } from "react";
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";

const API_BASE = import.meta.env.VITE_API_URL || "https://thisweekinphilly-api.onrender.com/api";
const NEIGHBORHOODS = ["All", "Center City", "Old City", "Fairmount", "University City", "North Philly", "Rittenhouse"];

const styles = {
  page: { minHeight: "100vh", background: "var(--cream)", display: "flex", flexDirection: "column" },
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
  list: { maxWidth: 900, margin: "0 auto", padding: "32px 24px", flex: 1 },
  card: {
    background: "#fff",
    borderRadius: 12,
    padding: "20px 24px",
    marginBottom: 12,
    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 16,
  },
  left: { flex: 1 },
  cardName: { fontFamily: "var(--font-display)", fontSize: "1.1rem", fontWeight: 700, color: "var(--ink)", marginBottom: 4 },
  special: { fontFamily: "var(--font-body)", fontSize: "1.05rem", color: "var(--brick)", fontWeight: 700, marginBottom: 6 },
  description: { fontFamily: "var(--font-body)", fontSize: "0.88rem", color: "var(--ink-soft)", lineHeight: 1.6, marginBottom: 8 },
  meta: { fontFamily: "var(--font-body)", fontSize: "0.82rem", color: "var(--stone-dark)", marginBottom: 3 },
  link: { fontSize: "0.82rem", color: "var(--brick)", textDecoration: "underline", fontFamily: "var(--font-body)", display: "inline-block", marginTop: 4, marginRight: 16 },
  loading: { textAlign: "center", padding: "80px 24px", fontFamily: "var(--font-body)", color: "var(--stone-dark)", fontSize: "1.1rem" },
};

export default function Museums() {
  const [museums, setMuseums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [neighborhood, setNeighborhood] = useState("All");

  useEffect(() => {
    fetch(`${API_BASE}/restaurants/museums`)
      .then(r => r.json())
      .then(data => { setMuseums(data.museums || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = (neighborhood === "All" ? museums : museums.filter(m => m.neighborhood === neighborhood))
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div style={styles.page}>
      <Header />
      <div style={styles.header}>
        <div style={styles.headerInner}>
          <h1 style={styles.headline}>Philly <span style={styles.accent}>Museums</span></h1>
          <p style={styles.sub}>World-class museums and attractions in Philadelphia</p>
        </div>
      </div>
      <div style={styles.filters}>
        {NEIGHBORHOODS.map(n => (
          <button key={n} style={styles.pill(n === neighborhood)} onClick={() => setNeighborhood(n)}>{n}</button>
        ))}
      </div>
      {loading ? (
        <div style={styles.loading}>Loading museums...</div>
      ) : (
        <div style={styles.list}>
          {filtered.map(m => (
            <div key={m.id} style={styles.card}>
              <div style={styles.left}>
                <div style={styles.cardName}>{m.name}</div>
                {m.address && <div style={styles.meta}>{m.address}</div>}
                {m.phone && <a href={`tel:${m.phone}`} style={{ fontSize: "0.82rem", color: "var(--ink)", fontFamily: "var(--font-body)", textDecoration: "none", display: "block", marginBottom: 2 }}>{m.phone}</a>}
                {m.hours && <div style={styles.meta}>🕐 {m.hours}</div>}
                {m.admission && <div style={styles.meta}>🎫 {m.admission}</div>}
                {m.special && <div style={styles.special}>{m.special}</div>}
                {m.description && <p style={styles.description}>{m.description}</p>}
                <div>
                  {m.url && <a href={m.url} target="_blank" rel="noopener noreferrer" style={styles.link}>Visit Website</a>}
                  {m.address && <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(m.name + " " + m.address)}`} target="_blank" rel="noopener noreferrer" style={{ ...styles.link, marginBottom: 12 }}>Get Directions</a>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      <Footer />
    </div>
  );
}
