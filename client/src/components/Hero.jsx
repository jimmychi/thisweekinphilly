import React from "react";

const styles = {
  hero: {
    background: "var(--ink)",
    backgroundImage: `
      radial-gradient(ellipse at 20% 50%, rgba(184,76,43,0.15) 0%, transparent 60%),
      radial-gradient(ellipse at 80% 20%, rgba(200,146,42,0.1) 0%, transparent 50%)
    `,
    padding: "48px 24px 40px",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
  },
  inner: {
    maxWidth: 1200,
    margin: "0 auto",
  },
  eyebrow: {
    fontFamily: "var(--font-body)",
    fontSize: "0.7rem",
    color: "var(--brass)",
    letterSpacing: "0.25em",
    textTransform: "uppercase",
    marginBottom: 10,
  },
  headline: {
    fontFamily: "var(--font-display)",
    fontSize: "clamp(2rem, 5vw, 3.2rem)",
    fontWeight: 900,
    color: "var(--cream)",
    lineHeight: 1.1,
    marginBottom: 12,
  },
  sub: {
    fontFamily: "var(--font-body)",
    fontStyle: "italic",
    fontSize: "1rem",
    color: "var(--stone-light)",
    maxWidth: 520,
  },
  accent: {
    color: "var(--brick)",
  },
};

export default function Hero() {
  return (
    <div style={styles.hero}>
      <div style={styles.inner}>
        <div style={styles.eyebrow}>Philadelphia, PA</div>
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
