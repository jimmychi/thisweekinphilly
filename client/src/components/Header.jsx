import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const styles = {
  header: {
    background: "var(--ink)",
    borderBottom: "3px solid var(--brick)",
    padding: "0 24px",
    position: "sticky",
    top: 0,
    zIndex: 100,
  },
  inner: {
    maxWidth: 1200,
    margin: "0 auto",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    height: 68,
  },
  logoWrap: {
    display: "flex",
    flexDirection: "column",
    lineHeight: 1,
  },
  logoMain: {
    fontFamily: "var(--font-display)",
    fontWeight: 900,
    fontSize: "clamp(1.15rem, 4.8vw, 1.5rem)",
    color: "var(--cream)",
    letterSpacing: "-0.5px",
    paddingBottom: 6,
    whiteSpace: "nowrap",
  },
  logoSub: {
    fontFamily: "var(--font-body)",
    fontSize: "clamp(0.55rem, 1.8vw, 0.65rem)",
    color: "var(--brass)",
    letterSpacing: "0.15em",
    textTransform: "uppercase",
    marginTop: 2,
    paddingBottom: 4,
    whiteSpace: "nowrap",
  },
  meta: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    marginLeft: "auto",
    paddingLeft: 8,
  },
  navBtn: (active, isMobile) => ({
    background: active ? "rgba(255,255,255,0.15)" : "transparent",
    color: "var(--cream)",
    fontFamily: "var(--font-body)",
    fontSize: isMobile ? "0.7rem" : "0.8rem",
    fontWeight: 600,
    padding: isMobile ? "4px 8px" : "6px 16px",
    borderRadius: 20,
    border: "1px solid rgba(255,255,255,0.3)",
    cursor: active ? "default" : "pointer",
    marginRight: isMobile ? 4 : 8,
  }),
};

const NAV_ITEMS = [
  { label: "Events", emoji: "📅", path: "/" },
  { label: "Restaurants", emoji: "🍽️", path: "/restaurants" },
  { label: "Bars", emoji: "🍺", path: "/bars" },
  { label: "Museums", emoji: "🏛️", path: "/museums" },
  { label: "Nightclubs", emoji: "🎶", path: "/nightclubs" },
  { label: "Happy Hours", emoji: "🍺", path: "/happyhours" },
];

export default function Header({ lastUpdated }) {
  const navigate = useNavigate();
  const location = window.location.pathname;
  const isMobile = window.innerWidth < 640;
  const [menuOpen, setMenuOpen] = useState(false);

  const isActive = (path) => path === "/" ? location === "/" : location.startsWith(path);

  return (
    <header style={styles.header}>
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }`}</style>
      <div style={styles.inner}>
        <div style={styles.logoWrap}>
          <span style={{...styles.logoMain, cursor: "pointer"}} onClick={() => navigate("/")}>This Week in Philly</span>
          <span style={{...styles.logoSub, cursor: "pointer"}} onClick={() => navigate("/")}>Philadelphia's Event Guide</span>
        </div>

        {isMobile ? (
          <div style={{ position: "relative", marginLeft: "auto" }}>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.3)", borderRadius: 8, color: "var(--cream)", padding: "6px 10px", fontSize: "1.2rem", cursor: "pointer" }}
            >
              ☰
            </button>
            {menuOpen && (
              <div style={{
                position: "absolute", top: 44, right: 0, background: "var(--ink)",
                border: "1px solid rgba(255,255,255,0.15)", borderRadius: 10,
                padding: "8px 0", minWidth: 160, zIndex: 200,
                boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
              }}>
                {NAV_ITEMS.map(item => (
                  <button
                    key={item.path}
                    onClick={() => { navigate(item.path); setMenuOpen(false); }}
                    style={{
                      display: "block", width: "100%", textAlign: "left",
                      background: isActive(item.path) ? "rgba(255,255,255,0.1)" : "transparent",
                      color: "var(--cream)", fontFamily: "var(--font-body)",
                      fontSize: "0.9rem", fontWeight: isActive(item.path) ? 700 : 400,
                      padding: "10px 20px", border: "none", cursor: "pointer",
                    }}
                  >
                    {item.emoji} {item.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div style={styles.meta}>
            {NAV_ITEMS.map(item => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                style={styles.navBtn(isActive(item.path), false)}
              >
                {item.emoji} {item.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </header>
  );
}
// Wed May  6 16:31:45 EDT 2026
