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
        <div style={{ textAlign: "center", paddingBottom: 8, display: "flex", justifyContent: "center", gap: 24 }}><a href="/privacy" style={{ fontFamily: "var(--font-body)", fontSize: "0.75rem", color: "var(--stone-light)", textDecoration: "none" }}>Privacy Policy</a><a href="/submit" style={{ fontFamily: "var(--font-body)", fontSize: "0.75rem", color: "var(--stone-light)", textDecoration: "none" }}>Submit Event</a></div>
      <div style={styles.tagline}>
          <span style={styles.brass}>Philadelphia's Weekly Event Guide</span>
        </div>
      </div>
    </footer>
  );
}
