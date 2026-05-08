import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../components/Header.jsx";
import { formatDate, formatTime } from "../utils/dates.js";


const KEYWORD_IMAGES = {
  dog: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=600&q=80",
  puppy: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=600&q=80",
  cat: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=600&q=80",
  jazz: "https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=600&q=80",
  comedy: "https://images.unsplash.com/photo-1527224538127-2104bb71c51b?w=600&q=80",
  art: "https://images.unsplash.com/photo-1580136579312-94651dfd596d?w=600&q=80",
  garden: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&q=80",
  plant: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&q=80",
  food: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&q=80",
  brunch: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&q=80",
  beer: "https://images.unsplash.com/photo-1535958636474-b021ee887b13?w=600&q=80",
  wine: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=600&q=80",
  yoga: "https://images.unsplash.com/photo-1575052814086-f385e2e2ad1b?w=600&q=80",
  run: "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=600&q=80",
  trivia: "https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?w=600&q=80",
  paint: "https://images.unsplash.com/photo-1579762593175-20226054cad0?w=600&q=80",
  craft: "https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=600&q=80",
  museum: "https://images.unsplash.com/photo-1565060169194-19fabf63012c?w=600&q=80",
  improv: "https://images.unsplash.com/photo-1527224538127-2104bb71c51b?w=600&q=80",
  theater: "https://images.unsplash.com/photo-1503095396549-807759245b35?w=600&q=80",
  ballet: "https://images.unsplash.com/photo-1580809361436-42a7ec204889?w=600&q=80",
  quixote: "https://images.unsplash.com/photo-1580809361436-42a7ec204889?w=600&q=80",
  academy: "https://images.unsplash.com/photo-1580809361436-42a7ec204889?w=600&q=80",
  orchestra: "https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=600&q=80",
  cello: "https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=600&q=80",
  classical: "https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=600&q=80",
  violin: "https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=600&q=80",
  tattoo: "https://images.unsplash.com/photo-1568515387631-8b650bbcdb90?w=600&q=80",
  workshop: "https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=600&q=80",
  cruise: "https://images.unsplash.com/photo-1548438294-1ad5d5f4f063?w=600&q=80",
  tea: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=600&q=80",
  rave: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600&q=80",
  dj: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600&q=80",
  tech: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&q=80",
  technology: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&q=80",
};

function getKeywordImage(title, venue) {
  if (venue && venue.toLowerCase().includes("academy of music")) {
    return "https://images.unsplash.com/photo-1580809361436-42a7ec204889?w=600&q=80";
  }
  if (!title) return null;
  const lower = title.toLowerCase();
  for (const [keyword, url] of Object.entries(KEYWORD_IMAGES)) {
    const regex = new RegExp("\\b" + keyword + "\\b");
    if (regex.test(lower)) return url;
  }
  return null;
}

const API_BASE = import.meta.env.VITE_API_URL || "/api";

const styles = {
  page: {
    minHeight: "100vh",
    background: "var(--cream)",
  },
  back: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "0 24px",
    fontFamily: "var(--font-body)",
    fontSize: "0.8rem",
    color: "rgba(255,255,255,0.7)",
    cursor: "pointer",
    background: "none",
    border: "none",
    position: "absolute",
    top: "50%",
    left: 0,
    transform: "translateY(-50%)",
    zIndex: 10,
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
    minWidth: 60,
    maxWidth: 60,
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
      <div style={{ position: "relative" }}>
        <Header />
        <button style={styles.back} onClick={() => navigate("/")}>← Back to Events</button>
      </div>

      {(() => { const ki = getKeywordImage(event.title, event.venue); const src = ki || event.image; return src ? <img src={src} alt={event.title} style={styles.hero} /> : <div style={styles.heroPlaceholder(event.category)}>{CATEGORY_EMOJI[event.category] || "📅"}</div>; })()}

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
              {event.address && <span style={{fontSize: "0.8rem", color: "var(--ink)", marginTop: 2}}>{event.address}</span>}
              {event.venueUrl && <a href={event.venueUrl.split("?")[0]} target="_blank" rel="noopener noreferrer" style={{fontSize: "0.8rem", color: "var(--brick)", marginTop: 2, textDecoration: "underline"}}>Visit Venue Website</a>}
              {event.phone && <span style={{fontSize: "0.8rem", color: "var(--ink)", marginTop: 2}}>{event.phone}</span>}
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
