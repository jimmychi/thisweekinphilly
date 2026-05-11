import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { formatTime, formatDate } from "../utils/dates.js";

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
    padding: "14px 16px 4px",
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
    color: "var(--ink)",
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
  sulic: "https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=600&q=80",
  classical: "https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=600&q=80",
  sulic: "https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=600&q=80",
  violin: "https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=600&q=80",
  luka: "https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=600&q=80",
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
  // v2: venue-based image override
  if (venue && venue.toLowerCase().includes("academy of music")) {
    return "https://images.unsplash.com/photo-1580809361436-42a7ec204889?w=600&q=80";
  }
  if (!title) return null;
  const lower = title.toLowerCase();
  if (lower.includes("mother's day") || lower.includes("mothers day")) return "/flowers.jpg";
  for (const [keyword, url] of Object.entries(KEYWORD_IMAGES)) {
    const regex = new RegExp("\\b" + keyword + "\\b");
    if (regex.test(lower)) return url;
  }
  return null;
}

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
        {(event.image || getKeywordImage(event.title, event.venue)) && !imgErr ? (
          <img src={getKeywordImage(event.title, event.venue) || event.image} alt={event.title} style={styles.img} onError={() => setImgErr(true)} />
        ) : (
          <div style={styles.imgPlaceholder(event.category)}>
            {CATEGORY_EMOJI[event.category] || "📅"}
          </div>
        )}
      </div>
      <div style={styles.body}>
        <div style={styles.title}>{event.title}</div>
        <div style={styles.meta}>
          {(event.date || event.time) && (
            <div style={styles.metaRow}>
              <span>{[event.date ? new Date(event.date + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" }) : null, event.time ? formatTime(event.time) : null].filter(Boolean).join(" · ")}</span>
            </div>
          )}
          {event.venue && (
            <div style={styles.metaRow}>
              <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {event.venue}
              </span>
            </div>
          )}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: "auto", paddingTop: 8 }}>
          {event.price && <span style={styles.price}>{event.price}</span>}

        </div>
      </div>
    </div>
  );
}