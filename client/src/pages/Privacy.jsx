import React from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header.jsx";

const styles = {
  page: { minHeight: "100vh", background: "var(--cream)" },
  content: {
    maxWidth: 800,
    margin: "0 auto",
    padding: "48px 24px",
    fontFamily: "var(--font-body)",
    color: "var(--ink)",
    lineHeight: 1.8,
  },
  h1: {
    fontFamily: "var(--font-display)",
    fontSize: "2.2rem",
    fontWeight: 900,
    color: "var(--ink)",
    marginBottom: 8,
  },
  updated: {
    fontSize: "0.85rem",
    color: "var(--stone-dark)",
    marginBottom: 40,
    fontStyle: "italic",
  },
  h2: {
    fontFamily: "var(--font-display)",
    fontSize: "1.2rem",
    fontWeight: 700,
    color: "var(--ink)",
    marginTop: 32,
    marginBottom: 8,
    borderBottom: "2px solid var(--brick)",
    paddingBottom: 4,
  },
  p: {
    marginBottom: 16,
    fontSize: "0.95rem",
  },
  a: {
    color: "var(--brick)",
    textDecoration: "none",
  },
};

export default function Privacy() {
  return (
    <div style={styles.page}>
      <Header />
      <div style={styles.content}>
        <h1 style={styles.h1}>Privacy Policy</h1>
        <p style={styles.updated}>Last updated: May 6, 2026</p>

        <p style={styles.p}>
          This Week in Philly ("we," "us," or "our") operates thisweekinphilly.com. This page explains what information we collect, how we use it, and your rights regarding your data.
        </p>

        <h2 style={styles.h2}>Information We Collect</h2>
        <p style={styles.p}>
          <strong>Usage Data:</strong> We use Google Analytics to collect anonymous information about how visitors use our site, including pages visited, time spent, device type, and general location (city/region level). This data is aggregated and does not identify you personally.
        </p>
        <p style={styles.p}>
          <strong>Event Submissions:</strong> When you submit an event through our Submit Event form, we collect your event details and email address. This information is stored securely in Airtable and used only to review and potentially publish your event on our site.
        </p>

        <h2 style={styles.h2}>How We Use Your Information</h2>
        <p style={styles.p}>We use the information we collect to:</p>
        <p style={styles.p}>• Improve and maintain the website<br />
        • Review and publish community-submitted events<br />
        • Understand how our site is being used<br />
        • Respond to event submission inquiries</p>

        <h2 style={styles.h2}>Google Analytics</h2>
        <p style={styles.p}>
          We use Google Analytics to help us understand how visitors use our site. Google Analytics uses cookies to collect anonymous traffic data. You can opt out of Google Analytics tracking by installing the{" "}
          <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer" style={styles.a}>
            Google Analytics Opt-out Browser Add-on
          </a>.
        </p>

        <h2 style={styles.h2}>Cookies</h2>
        <p style={styles.p}>
          Our site uses cookies only through Google Analytics for anonymous usage tracking. We do not use cookies for advertising or to track you across other websites.
        </p>

        <h2 style={styles.h2}>Third-Party Services</h2>
        <p style={styles.p}>
          Our site displays event data from Ticketmaster, PredictHQ, and Google Places. Links to third-party sites (such as Ticketmaster for ticket purchases) are governed by those sites' own privacy policies.
        </p>

        <h2 style={styles.h2}>Data Sharing</h2>
        <p style={styles.p}>
          We do not sell, trade, or share your personal information with third parties. Email addresses collected through event submissions are used solely for that purpose and are never shared or used for marketing.
        </p>

        <h2 style={styles.h2}>Your Rights</h2>
        <p style={styles.p}>
          You have the right to request access to, correction of, or deletion of any personal information you have submitted to us. To make such a request, please contact us at the email below.
        </p>

        <h2 style={styles.h2}>Children's Privacy</h2>
        <p style={styles.p}>
          This site is not directed at children under 13. We do not knowingly collect personal information from children.
        </p>

        <h2 style={styles.h2}>Changes to This Policy</h2>
        <p style={styles.p}>
          We may update this privacy policy from time to time. Any changes will be posted on this page with an updated date.
        </p>

        <h2 style={styles.h2}>Contact Us</h2>
        <p style={styles.p}>
          If you have any questions about this privacy policy, please contact us at:{" "}
          <a href="mailto:hello@thisweekinphilly.com" style={styles.a}>hello@thisweekinphilly.com</a>
        </p>
      </div>
    </div>
  );
}
