import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { formatTime } from "../utils/dates.js";

const CATEGORY_COLORS = {
  concerts: "#b84c2b",
  sports: "#2b6cb0",
  arts: "#6b46c1",
  food: "#c8922a",
  family: "#2f855a",
  nightlife: "#1a1410",
  community: "#6b7c5e",
  other: "#9e9080",
};

const styles = {
  card: {
    background: "var(--warm-white)",
    border: "1px solid var(--border)",
    borderRadius: 8,
    overflow: "hidden",
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
    cursor: "pointer",
    display: "flex",
    flexDirection: "column",
  },
  imgWrap: {
    position: "relative",
    height: 160,
    background: "var(--stone-light)",
    overflow: "hidden",
    flexShrink: 0,
  },
  img: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  imgPlaceholder: (category) => ({
    width: "100%",
    height: "100%",
    background: CATEGORY_COLORS[category] || "#9e9080",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "2.5rem",
    opacity: 0.85,
  }),
  body: {
    padding: "14px 16px 16px",
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
  title: {
    fontFamily: "var(--font-display)",
    fontWeight: 700,
    fontSize: "1.05rem",
    lineHeight: 1.3,
    color: "var(--ink)",
  },
  meta: {
    display: "flex",
    flexDirection: "column",
    gap: 3,
    marginTop: 4,
  },
  metaRow: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    fontSize: "0.8rem",
    color: "var(--stone)",
  },
  icon: { fontSize: "0.85rem", flexShrink: 0 },
  price: {
    display: "inline-block",
    marginTop: "auto",
    paddingTop: 10,
    fontSize: "0.8rem",
    fontWeight: 600,
    color: "var(--brick)",
    fontFamily: "var(--font-body)",
  },
  source: {
    fontSize: "0.65rem",
    color: "var(--stone-light)",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
  },
};

const CATEGORY_EMOJI = {
  concerts: "🎵", sports: "🏈", arts: "🎨", food: "🍻",
  family: "👨‍👩‍👧", nightlife: "🌙", community: "🤝", other: "📅",
};

export default function EventCard({ event, style }) {
  const [imgErr, setImgErr] = useState(false);
  const navigate = useNavigate();

  return (
    <div
      style={{ ...styles.card, ...style }}
      onClick={() => navigate(`/event/${event.id}`)}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-3px)";
        e.currentTarget.style.boxShadow = "0 8px 24px var(--shadow)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      <div style={styles.imgWrap}>
        {event.image && !imgErr ? (
          <img src={event.image} alt={event.title} style={styles.img} onError={() => setImgErr(true)} />
        ) : (
          <div style={styles.imgPlaceholder(event.category)}>
            {CATEGORY_EMOJI[event.category] || "📅"}
          </div>
        )}
      </div>
      <div style={styles.body}>
        <div style={styles.title}>{event.title}</div>
        <div style={styles.meta}>
          {event.time && (
            <div style={styles.metaRow}>
              <span style={styles.icon}>🕐</span>
              <span>{formatTime(event.time)}</span>
            </div>
          )}
          {event.venue && (
            <div style={styles.metaRow}>
              <span style={styles.icon}>📍</span>
              <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {event.venue}
              </span>
            </div>
          )}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: "auto", paddingTop: 8 }}>
          {event.price && <span style={styles.price}>{event.price}</span>}
          <span style={styles.source}>{event.source}</span>
        </div>
      </div>
    </div>
  );
}