import React from "react";

const styles = {
  hero: {
    position: "relative",
    padding: "64px 24px 48px",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
    overflow: "hidden",
    backgroundImage: "url(https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1600&q=80)",
    backgroundSize: "cover",
    backgroundPosition: "center 60%",
  },
  overlay: {
    position: "absolute",
    inset: 0,
    background: "linear-gradient(to bottom, rgba(10,6,4,0.6) 0%, rgba(10,6,4,0.75) 100%)",
  },
  inner: {
    position: "relative",
    zIndex: 2,
    maxWidth: 1200,
    margin: "0 auto",
  },
  headline: {
    fontFamily: "var(--font-display)",
    fontSize: "clamp(2rem, 5vw, 3.2rem)",
    fontWeight: 900,
    color: "#fff",
    lineHeight: 1.1,
    marginBottom: 12,
    textShadow: "0 2px 8px rgba(0,0,0,0.5)",
  },
  sub: {
    fontFamily: "var(--font-body)",
    fontStyle: "italic",
    fontSize: "1rem",
    color: "rgba(255,255,255,0.85)",
    maxWidth: 520,
    textShadow: "0 1px 4px rgba(0,0,0,0.5)",
  },
  accent: {
    color: "var(--brick)",
  },
};

export default function Hero() {
  return (
    <div style={styles.hero}>
      <div style={styles.overlay} />
      <div style={styles.inner}>
        <h1 style={styles.headline}>
          What's Happening<br />
          <span style={styles.accent}>This Week</span>
        </h1>
        <p style={styles.sub}>
          Philly concerts, food, arts, sports & community events.
        </p>
      </div>
    </div>
  );
}
