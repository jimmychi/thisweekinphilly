import React from "react";
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

const CATEGORY_EMOJI = {
  concerts: "🎵", sports: "🏈", arts: "🎨", food: "🍻",
  family: "👨‍👩‍👧", nightlife: "🌙", community: "🤝", other: "📅",
};

export default function EventCard({ event, isLast }) {
  const navigate = useNavigate();
  const color = CATEGORY_COLORS[event.category] || "#9e9080";
  const emoji = CATEGORY_EMOJI[event.category] || "📅";

  return (
    <div
      onClick={() => navigate(`/event/${event.id}`)}
      onMouseEnter={(e) => e.currentTarget.style.background = "var(--cream)"}
      onMouseLeave={(e) => e.currentTarget.style.background = "var(--warm-white)"}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        padding: "14px 16px",
        cursor: "pointer",
        background: "var(--warm-white)",
        borderBottom: isLast ? "none" : "1px solid var(--border)",
        transition: "background 0.15s ease",
      }}
    >
      {/* Category emoji */}
      <span style={{ fontSize: "1.2rem", flexShrink: 0, width: 28, textAlign: "center" }}>{emoji}</span>

      {/* Title + venue */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontFamily: "var(--font-display)",
          fontWeight: 700,
          fontSize: "0.95rem",
          color: "var(--ink)",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}>
          {event.title}
        </div>
{event.venue && event.venue !== "Philadelphia, PA" && (
          <div style={{
            fontSize: "0.78rem",
            color: "var(--stone)",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            marginTop: 2,
          }}>
            {event.venue}
          </div>
        )}
        {event.address && event.address !== "Philadelphia, PA" && (
          <div style={{
            fontSize: "0.78rem",
            color: "var(--ink-soft)",
            marginTop: 4,
            display: "-webkit-box",
            overflow: "hidden",
          }}>
            {event.address}
          </div>
        )}
      </div>

      {/* Time + price */}
      <div style={{ flexShrink: 0, textAlign: "right" }}>
        {event.time && (
          <div style={{ fontSize: "0.82rem", color: "var(--ink)", fontWeight: 600 }}>
            {formatTime(event.time)}
          </div>
        )}
        {event.price && (
          <div style={{ fontSize: "0.75rem", color: color, fontWeight: 600, marginTop: 2 }}>
            {event.price}
          </div>
        )}
      </div>
    </div>
  );
}