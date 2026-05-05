import React from "react";

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
    fontSize: "1.5rem",
    color: "var(--cream)",
    letterSpacing: "-0.5px",
  },
  logoSub: {
    fontFamily: "var(--font-body)",
    fontSize: "0.65rem",
    color: "var(--brass)",
    letterSpacing: "0.2em",
    textTransform: "uppercase",
    marginTop: 2,
  },
  meta: {
    display: "flex",
    alignItems: "center",
    gap: 16,
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
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric", year: "numeric",
  });

  return (
    <header style={styles.header}>
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }`}</style>
      <div style={styles.inner}>
        <div style={styles.logoWrap}>
          <span style={styles.logoMain}>This Week in Philly</span>
          <span style={styles.logoSub}>Philadelphia's Event Guide</span>
        </div>
        <div style={styles.meta}>
          <span style={styles.date}>{today}</span>
          <div style={styles.dot} title={lastUpdated ? `Updated ${lastUpdated.toLocaleTimeString()}` : "Live"} />
        </div>
      </div>
    </header>
  );
}
