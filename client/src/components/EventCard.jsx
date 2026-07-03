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

const CATEGORY_EMOJI = {
  concerts: "🎵", sports: "🏈", arts: "🎨", food: "🍻",
  family: "👨‍👩‍👧", nightlife: "🌙", community: "🤝", other: "📅",
};

export default function EventCard({ event, isLast }) {
  const navigate = useNavigate();
  const color = CATEGORY_COLORS[event.category] || "#9e9080";
  const emoji = CATEGORY_EMOJI[event.category] || "📅";
  const [imgErr, setImgErr] = useState(false);

  return (
    <div
      onClick={() => navigate(`/event/${event.id}`)}
      onMouseEnter={(e) => e.currentTarget.style.background = "var(--cream)"}
      onMouseLeave={(e) => e.currentTarget.style.background = "var(--warm-white)"}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        padding: "12px 16px",
        cursor: "pointer",
        background: "var(--warm-white)",
        borderBottom: isLast ? "none" : "1px solid var(--border)",
        transition: "background 0.15s ease",
      }}
    >
      <div style={{
        flexShrink: 0,
        width: 80,
        height: 80,
        borderRadius: 6,
        overflow: "hidden",
        background: color,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "1.8rem",
      }}>
        {event.image && !imgErr ? (
          <img
            src={event.image}
            alt={event.title}
            onError={() => setImgErr(true)}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <span>{emoji}</span>
        )}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontFamily: "var(--font-display)",
          fontWeight: 700,
          fontSize: "1.1rem",
          color: "var(--ink)",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}>
          {event.title}
        </div>
        {event.venue && event.venue !== "Philadelphia, PA" && (
          <div style={{
            fontSize: "0.88rem",
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
            fontSize: "0.88rem",
            color: "var(--ink-soft)",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            marginTop: 2,
          }}>
            {event.address}
          </div>
        )}
      </div>

      <div style={{ flexShrink: 0, textAlign: "right" }}>
        {event.time && (
          <div style={{ fontSize: "0.92rem", color: "var(--ink)", fontWeight: 600 }}>
            {formatTime(event.time)}
          </div>
        )}
        {event.price && (
          <div style={{ fontSize: "0.85rem", color: color, fontWeight: 600, marginTop: 2 }}>
            {event.price}
          </div>
        )}
      </div>
    </div>
  );
}
