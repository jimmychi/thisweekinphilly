import React from "react";

const styles = {
  footer: {
    background: "var(--ink)",
    borderTop: "3px solid var(--brick)",
    padding: "32px 24px",
    textAlign: "center",
  },
  inner: {
    maxWidth: 1200,
    margin: "0 auto",
  },
  name: {
    fontFamily: "var(--font-display)",
    fontStyle: "italic",
    fontSize: "1.2rem",
    color: "var(--cream)",
    marginBottom: 8,
  },
  tagline: {
    fontFamily: "var(--font-body)",
    fontSize: "0.8rem",
    color: "var(--stone)",
  },
  brass: { color: "var(--brass)" },
};

export default function Footer({ lastUpdated }) {
  return (
    <footer style={styles.footer}>
      <div style={styles.inner}>
        <div style={styles.name}>This Week in Philly</div>
        <div style={styles.tagline}>
          Events sourced from Ticketmaster & Eventbrite ·{" "}
          <span style={styles.brass}>Auto-updated every 15 minutes</span>
          {lastUpdated && ` · Last refresh: ${lastUpdated.toLocaleTimeString()}`}
        </div>
      </div>
    </footer>
  );
}
