import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";

const API_BASE = import.meta.env.VITE_API_URL || "https://thisweekinphilly-api.onrender.com/api";

export default function MuseumDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [museum, setMuseum] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/restaurants/museums`)
      .then(r => r.json())
      .then(data => {
        const m = (data.museums || []).find(m => encodeURIComponent(m.id) === id || m.id === id);
        setMuseum(m || null);
        setLoading(false);
        if (m) document.title = `${m.name} - Philadelphia Museum | This Week in Philly`;
      })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh", fontFamily: "var(--font-display)", fontSize: "1.4rem", color: "var(--stone)" }}>
      Loading...
    </div>
  );

  if (!museum) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh", fontFamily: "var(--font-display)", fontSize: "1.4rem", color: "var(--stone)" }}>
      Museum not found. <button onClick={() => navigate("/museums")} style={{ marginLeft: 16, color: "var(--brick)", background: "none", border: "none", cursor: "pointer", fontFamily: "var(--font-display)", fontSize: "1rem" }}>← Back</button>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "var(--cream)" }}>
      <div style={{ position: "relative" }}>
        <Header />
        <button onClick={() => navigate("/museums")} style={{ position: "absolute", top: "50%", left: 24, transform: "translateY(-50%)", background: "none", border: "none", color: "rgba(255,255,255,0.7)", fontFamily: "var(--font-body)", fontSize: "0.8rem", cursor: "pointer", zIndex: 10 }}>
          ← Back to Museums
        </button>
      </div>

      {/* Hero Image */}
      <div style={{ maxWidth: 800, margin: "0 auto", padding: "24px 24px 0" }}>
        {museum.image ? (
          <img src={museum.image} alt={museum.name} style={{ width: "100%", height: 320, objectFit: "cover", borderRadius: 8, display: "block" }} />
        ) : (
          <div style={{ width: "100%", height: 320, background: "var(--ink)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "5rem" }}>🏛️</div>
        )}
      </div>

      {/* Content */}
      <div style={{ maxWidth: 800, margin: "0 auto", padding: "40px 24px 80px" }}>
        <div style={{ fontFamily: "var(--font-body)", fontSize: "0.7rem", color: "var(--brass)", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 12 }}>
          Philadelphia Museum
        </div>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.8rem, 4vw, 2.8rem)", fontWeight: 900, color: "var(--ink)", lineHeight: 1.15, marginBottom: 8 }}>
          {museum.name}
          {museum.kidFriendly && <span style={{ fontSize: "0.8rem", background: "#e8f5e9", color: "#2e7d32", borderRadius: 20, padding: "4px 12px", fontWeight: 600, marginLeft: 12, verticalAlign: "middle" }}>👶 Kid Friendly</span>}
        </h1>

        {/* Info Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16, background: "var(--warm-white)", border: "1px solid var(--border)", borderRadius: 8, padding: 16, marginBottom: 24 }}>
          {museum.address && (
            <div>
              <div style={{ fontSize: "0.65rem", color: "var(--stone)", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 4 }}>Address</div>
              <div style={{ fontSize: "0.95rem", color: "var(--ink)", fontWeight: 600 }}>{museum.address}</div>
              <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(museum.name + " " + museum.address)}`} target="_blank" rel="noopener noreferrer" style={{ fontSize: "0.8rem", color: "var(--brick)", textDecoration: "underline", display: "block", marginTop: 4 }}>Get Directions</a>
            </div>
          )}
          {museum.phone && (
            <div>
              <div style={{ fontSize: "0.65rem", color: "var(--stone)", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 4 }}>Phone</div>
              <a href={`tel:${museum.phone}`} style={{ fontSize: "0.95rem", color: "var(--ink)", fontWeight: 600, textDecoration: "none" }}>{museum.phone}</a>
            </div>
          )}
          {museum.hours && (
            <div>
              <div style={{ fontSize: "0.65rem", color: "var(--stone)", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 4 }}>Hours</div>
              <div style={{ fontSize: "0.95rem", color: "var(--ink)", fontWeight: 600 }}>{museum.hours}</div>
            </div>
          )}
          {museum.admission && (
            <div>
              <div style={{ fontSize: "0.65rem", color: "var(--stone)", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 4 }}>Admission</div>
              <div style={{ fontSize: "0.95rem", color: "var(--ink)", fontWeight: 600 }}>{museum.admission}</div>
            </div>
          )}
          {museum.neighborhood && (
            <div>
              <div style={{ fontSize: "0.65rem", color: "var(--stone)", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 4 }}>Neighborhood</div>
              <div style={{ fontSize: "0.95rem", color: "var(--ink)", fontWeight: 600 }}>{museum.neighborhood}</div>
            </div>
          )}
        </div>

        {museum.special && (
          <div style={{ background: "var(--warm-white)", border: "1px solid var(--border)", borderRadius: 8, padding: 16, marginBottom: 24 }}>
            <div style={{ fontSize: "0.65rem", color: "var(--stone)", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 8 }}>Current Special</div>
            <div style={{ fontFamily: "var(--font-body)", fontSize: "1rem", color: "var(--brick)", fontWeight: 700 }}>{museum.special}</div>
          </div>
        )}

        {museum.description && (
          <p style={{ fontFamily: "var(--font-body)", fontSize: "1rem", color: "var(--ink-soft)", lineHeight: 1.7, marginBottom: 40 }}>{museum.description}</p>
        )}

        {museum.url && (
          <a href={museum.url} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 10, background: "var(--brick)", color: "#fff", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1.1rem", padding: "16px 40px", borderRadius: 40, textDecoration: "none" }}>
            Visit Website →
          </a>
        )}
      </div>
      <Footer />
    </div>
  );
}
