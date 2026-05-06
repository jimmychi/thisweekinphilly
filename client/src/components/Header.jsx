import React from "react";
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
    fontSize: "clamp(1.25rem, 4.8vw, 1.5rem)",
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
  date: {
    fontFamily: "var(--font-body)",
    fontSize: "0.8rem",
    color: "var(--stone-light)",
    fontStyle: "italic",
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: "50%",
    background: "var(--brick)",
    animation: "pulse 2s ease-in-out infinite",
  },
};

export default function Header({ lastUpdated }) {
  const navigate = useNavigate();
  const location = window.location.pathname;
  const isMobile = window.innerWidth < 640;
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric", year: "numeric",
  });

  return (
    <header style={styles.header}>
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }`}</style>
      <div style={styles.inner}>
        <div style={styles.logoWrap}>
          <span style={{...styles.logoMain, cursor: "pointer"}} onClick={() => navigate("/")}>This Week in Philly</span>
          <span style={{...styles.logoSub, cursor: "pointer"}} onClick={() => navigate("/")}>Philadelphia's Event Guide</span>
        </div>
        <div style={styles.meta}>
          <button onClick={() => location !== "/" && navigate("/")} style={{ background: location === "/" ? "rgba(255,255,255,0.15)" : "transparent", color: "var(--cream)", fontFamily: "var(--font-body)", fontSize: isMobile ? "0.7rem" : "0.8rem", fontWeight: 600, padding: isMobile ? "4px 8px" : "6px 16px", borderRadius: 20, border: "1px solid rgba(255,255,255,0.3)", cursor: location === "/" ? "default" : "pointer", marginRight: isMobile ? 4 : 8 }}>📅 Events</button>
          <button onClick={() => !location.startsWith("/restaurants") && navigate("/restaurants")} style={{ background: location.startsWith("/restaurants") ? "rgba(255,255,255,0.15)" : "transparent", color: "var(--cream)", fontFamily: "var(--font-body)", fontSize: isMobile ? "0.7rem" : "0.8rem", fontWeight: 600, padding: isMobile ? "4px 8px" : "6px 16px", borderRadius: 20, border: "1px solid rgba(255,255,255,0.3)", cursor: location.startsWith("/restaurants") ? "default" : "pointer", marginRight: isMobile ? 4 : 8 }}>🍽️ Restaurants</button>
          <button onClick={() => navigate("/submit")} style={{ background: "var(--brick)", color: "#fff", fontFamily: "var(--font-body)", fontSize: isMobile ? "0.7rem" : "0.8rem", fontWeight: 600, padding: isMobile ? "4px 8px" : "6px 16px", borderRadius: 20, border: "none", cursor: "pointer" }}>
            {isMobile ? "+" : "+ Submit Event"}
          </button>
          
          
        </div>
      </div>
    </header>
  );
}
// Wed May  6 16:31:45 EDT 2026
