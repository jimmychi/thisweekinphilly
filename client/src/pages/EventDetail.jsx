import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../components/Header.jsx";
import { formatDate, formatTime } from "../utils/dates.js";

const API_BASE = import.meta.env.VITE_API_URL || "/api";

const styles = {
  page: {
    minHeight: "100vh",
    background: "var(--cream)",
  },
  back: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "16px 24px",
    fontFamily: "var(--font-body)",
    fontSize: "0.85rem",
    color: "var(--ink-soft)",
    cursor: "pointer",
    background: "none",
    border: "none",
    transition: "color 0.2s",
  },
  hero: {
    width: "100%",
    height: 380,
    objectFit: "cover",
    display: "block",
  },
  heroPlaceholder: (category) => ({
    width: "100%",
    height: 380,
    background: "var(--ink)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "5rem",
  }),
  body: {
    maxWidth: 800,
    margin: "0 auto",
    padding: "40px 24px 80px",
  },
  category: {
    fontFamily: "var(--font-body)",
    fontSize: "0.7rem",
    color: "var(--brass)",
    letterSpacing: "0.2em",
    textTransform: "uppercase",
    marginBottom: 12,
  },
  title: {
    fontFamily: "var(--font-display)",
    fontSize: "clamp(1.8rem, 4vw, 2.8rem)",
    fontWeight: 900,
    color: "var(--ink)",
    lineHeight: 1.15,
    marginBottom: 24,
  },
  infoGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
    gap: 16,
    background: "var(--warm-white)",
    border: "1px solid var(--border)",
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
  },
  infoItem: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
  },
  infoLabel: {
    fontFamily: "var(--font-body)",
    fontSize: "0.65rem",
    color: "var(--stone)",
    textTransform: "uppercase",
    letterSpacing: "0.12em",
  },
  infoValue: {
    fontFamily: "var(--font-body)",
    fontSize: "0.95rem",
    color: "var(--ink)",
    fontWeight: 600,
  },
  description: {
    fontFamily: "var(--font-body)",
    fontSize: "1rem",
    color: "var(--ink-soft)",
    lineHeight: 1.7,
    marginBottom: 40,
  },
  ctaWrap: {
    position: "sticky",
    bottom: 24,
    display: "flex",
    justifyContent: "center",
  },
  cta: {
    display: "inline-flex",
    alignItems: "center",
    gap: 10,
    background: "var(--brick)",
    color: "#fff",
    fontFamily: "var(--font-display)",
    fontWeight: 700,
    fontSize: "1.1rem",
    padding: "16px 40px",
    borderRadius: 40,
    border: "none",
    cursor: "pointer",
    boxShadow: "0 4px 20px rgba(184,76,43,0.4)",
    transition: "transform 0.2s, box-shadow 0.2s",
    textDecoration: "none",
  },
  loading: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: "60vh",
    fontFamily: "var(--font-display)",
    fontStyle: "italic",
    fontSize: "1.4rem",
    color: "var(--stone)",
  },
};

const CATEGORY_EMOJI = {
  concerts: "🎵", sports: "🏈", arts: "🎨", food: "🍻",
  family: "👨‍👩‍👧", nightlife: "🌙", community: "🤝", other: "📅",
};

export default function EventDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEvent() {
      try {
        const res = await fetch(`${API_BASE}/events/${id}`);
        if (!res.ok) throw new Error("Not found");
        const data = await res.json();
        setEvent(data.event);
      } catch {
        navigate("/");
      } finally {
        setLoading(false);
      }
    }
    fetchEvent();
  }, [id]);

  if (loading) return (
    <div style={styles.loading}>Loading event...</div>
  );
  if (!event) return null;

  return (
    <div style={styles.page}>
      <Header />
      <button style={styles.back} onClick={() => navigate("/")}>
        Back to all events
      </button>

      {event.image ? (
        <img src={event.image} alt={event.title} style={styles.hero} />
      ) : (
        <div style={styles.heroPlaceholder(event.category)}>
          {CATEGORY_EMOJI[event.category] || "📅"}
        </div>
      )}

      <div style={styles.body}>
        <div style={styles.category}>{event.category}</div>
        <h1 style={styles.title}>{event.title}</h1>

        <div style={styles.infoGrid}>
          {event.date && (
            <div style={styles.infoItem}>
              <span style={styles.infoLabel}>Date</span>
              <span style={styles.infoValue}>{formatDate(event.date)}</span>
            </div>
          )}
          {event.time && (
            <div style={styles.infoItem}>
              <span style={styles.infoLabel}>Time</span>
              <span style={styles.infoValue}>{formatTime(event.time)}</span>
            </div>
          )}
          {event.venue && (
            <div style={styles.infoItem}>
              <span style={styles.infoLabel}>Venue</span>
              <span style={styles.infoValue}>{event.venue === event.title || event.venue === "Philadelphia, PA" ? "Philadelphia, PA" : event.venue}</span>
              {event.address && <span style={{fontSize: "0.8rem", color: "var(--stone)", marginTop: 2}}>{event.address}</span>}
              {event.phone && <span style={{fontSize: "0.8rem", color: "var(--stone)", marginTop: 2}}>{event.phone}</span>}
            </div>
          )}


          {event.price && (
            <div style={styles.infoItem}>
              <span style={styles.infoLabel}>Price</span>
              <span style={styles.infoValue}>{event.price}</span>
            </div>
          )}
        </div>

        {event.description && (
          <p style={styles.description}>{event.description}</p>
        )}

        <div style={styles.ctaWrap}>
          <a
            href={event.url}
            target="_blank"
            rel="noopener noreferrer"
            style={styles.cta}
          >
            {event.source === "predicthq" ? "Find Tickets & Info" : "Get Tickets on Ticketmaster"}
          </a>
        </div>
      </div>
    </div>
  );
}// Tue May  5 20:36:15 EDT 2026
