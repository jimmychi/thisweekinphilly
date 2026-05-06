import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";

const API_BASE = import.meta.env.VITE_API_URL || "/api";

const styles = {
  page: { minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--cream)" },
  body: { maxWidth: 680, margin: "0 auto", padding: "48px 24px 80px", flex: 1 },
  eyebrow: { fontFamily: "var(--font-body)", fontSize: "0.7rem", color: "var(--brass)", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 10 },
  title: { fontFamily: "var(--font-display)", fontSize: "2.2rem", fontWeight: 900, color: "var(--ink)", marginBottom: 8 },
  subtitle: { fontFamily: "var(--font-body)", fontStyle: "italic", color: "var(--stone)", marginBottom: 40 },
  form: { display: "flex", flexDirection: "column", gap: 20 },
  field: { display: "flex", flexDirection: "column", gap: 6 },
  label: { fontFamily: "var(--font-body)", fontSize: "0.8rem", fontWeight: 600, color: "var(--ink-soft)", textTransform: "uppercase", letterSpacing: "0.1em" },
  input: { fontFamily: "var(--font-body)", fontSize: "1rem", padding: "10px 14px", border: "1.5px solid var(--border)", borderRadius: 6, background: "var(--warm-white)", color: "var(--ink)", outline: "none" },
  textarea: { fontFamily: "var(--font-body)", fontSize: "1rem", padding: "10px 14px", border: "1.5px solid var(--border)", borderRadius: 6, background: "var(--warm-white)", color: "var(--ink)", outline: "none", minHeight: 120, resize: "vertical" },
  row: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 },
  btn: { background: "var(--brick)", color: "#fff", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1rem", padding: "14px 32px", borderRadius: 40, border: "none", cursor: "pointer", marginTop: 8 },
  success: { background: "#f0fdf4", border: "1.5px solid #86efac", borderRadius: 8, padding: 24, textAlign: "center", fontFamily: "var(--font-body)" },
  successTitle: { fontFamily: "var(--font-display)", fontSize: "1.4rem", color: "#166534", marginBottom: 8 },
  error: { background: "#fef2f2", border: "1.5px solid #fca5a5", borderRadius: 8, padding: 12, fontFamily: "var(--font-body)", fontSize: "0.9rem", color: "#991b1b" },
};

export default function SubmitEvent() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: "", date: "", time: "", venue: "", description: "", url: "", email: "" });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/events/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Submission failed");
      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.page}>
      <Header />
      <div style={styles.body}>
        <div style={styles.eyebrow}>Community</div>
        <h1 style={styles.title}>Submit an Event</h1>
        <p style={styles.subtitle}>Know about a great Philly event? Share it with the community!</p>

        {success ? (
          <div style={styles.success}>
            <div style={styles.successTitle}>🎉 Event Submitted!</div>
            <p>Thanks for sharing! We will review your event and post it soon.</p>
            <button style={{ ...styles.btn, marginTop: 16 }} onClick={() => navigate("/")}>Back to Events</button>
          </div>
        ) : (
          <form style={styles.form} onSubmit={handleSubmit}>
            {error && <div style={styles.error}>{error}</div>}
            <div style={styles.field}>
              <label style={styles.label}>Event Name *</label>
              <input style={styles.input} name="title" value={form.title} onChange={handleChange} placeholder="e.g. Jazz Night at World Cafe Live" required />
            </div>
            <div style={styles.row}>
              <div style={styles.field}>
                <label style={styles.label}>Date *</label>
                <input style={styles.input} name="date" type="date" value={form.date} onChange={handleChange} required />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Time</label>
                <input style={styles.input} name="time" value={form.time} onChange={handleChange} placeholder="e.g. 7:00 PM" />
              </div>
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Venue</label>
              <input style={styles.input} name="venue" value={form.venue} onChange={handleChange} placeholder="e.g. World Cafe Live, 3025 Walnut St" />
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Description</label>
              <textarea style={styles.textarea} name="description" value={form.description} onChange={handleChange} placeholder="Tell us about the event..." />
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Event URL</label>
              <input style={styles.input} name="url" type="url" value={form.url} onChange={handleChange} placeholder="https://..." />
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Your Email</label>
              <input style={styles.input} name="email" type="email" value={form.email} onChange={handleChange} placeholder="so we can follow up if needed" />
            </div>
            <button style={styles.btn} type="submit" disabled={loading}>
              {loading ? "Submitting..." : "Submit Event →"}
            </button>
          </form>
        )}
      </div>
      <Footer />
    </div>
  );
}
