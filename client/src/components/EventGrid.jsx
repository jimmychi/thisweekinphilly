import React from "react";
import EventCard from "./EventCard.jsx";
import { groupEventsByDate, getDayLabel } from "../utils/dates.js";

const styles = {
  wrap: {
    maxWidth: 1200,
    margin: "0 auto",
    padding: "32px 24px 64px",
  },
  section: {
    marginBottom: 40,
  },
  dayHeader: {
    display: "flex",
    alignItems: "center",
    gap: 16,
    marginBottom: 18,
  },
  dayLabel: {
    fontFamily: "var(--font-display)",
    fontStyle: "italic",
    fontSize: "1.6rem",
    fontWeight: 700,
    color: "var(--ink)",
  },
  dayLine: {
    flex: 1,
    height: 1,
    background: "var(--border)",
  },
  count: {
    fontSize: "0.78rem",
    color: "var(--stone)",
    fontFamily: "var(--font-body)",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
    gap: 20,
  },
  emptyState: {
    textAlign: "center",
    padding: "80px 24px",
    color: "var(--stone)",
    fontFamily: "var(--font-body)",
  },
  emptyIcon: { fontSize: "3rem", marginBottom: 16 },
  emptyTitle: {
    fontFamily: "var(--font-display)",
    fontSize: "1.4rem",
    fontStyle: "italic",
    color: "var(--ink-soft)",
    marginBottom: 8,
  },
  skeleton: {
    background: "linear-gradient(90deg, var(--stone-light) 25%, var(--border) 50%, var(--stone-light) 75%)",
    backgroundSize: "600px 100%",
    animation: "shimmer 1.5s infinite",
    borderRadius: 8,
    height: 280,
  },
};

function Skeleton() {
  return (
    <div style={styles.wrap}>
      <div style={{ marginBottom: 40 }}>
        <div style={{ ...styles.skeleton, height: 28, width: 160, marginBottom: 18 }} />
        <div style={styles.grid}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} style={{ ...styles.skeleton, animationDelay: `${i * 0.1}s` }} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function EventGrid({ events, loading, error }) {
  if (loading) return <Skeleton />;

  if (error) {
    return (
      <div style={styles.wrap}>
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>⚠️</div>
          <div style={styles.emptyTitle}>Couldn't load events</div>
          <p style={{ fontSize: "0.9rem" }}>Check that your API keys are configured and try again.</p>
        </div>
      </div>
    );
  }

  if (!events.length) {
    return (
      <div style={styles.wrap}>
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>🏙️</div>
          <div style={styles.emptyTitle}>No events found</div>
          <p style={{ fontSize: "0.9rem" }}>Try a different category or check back soon.</p>
        </div>
      </div>
    );
  }

  const groups = groupEventsByDate(events);
  const sortedDates = Object.keys(groups).sort();

  return (
    <main style={styles.wrap}>
      {sortedDates.map((date, di) => (
        <section key={date} style={styles.section}>
          <div style={styles.dayHeader}>
            <h2 style={styles.dayLabel}>{getDayLabel(date)}</h2>
            <div style={styles.dayLine} />
            <span style={styles.count}>{groups[date].length} event{groups[date].length !== 1 ? "s" : ""}</span>
          </div>
          <div style={styles.grid}>
            {groups[date].map((event, i) => (
              <EventCard
                key={event.id}
                event={event}
                style={{ animation: `fadeUp 0.4s ease ${(i % 6) * 0.06}s both` }}
              />
            ))}
          </div>
        </section>
      ))}
    </main>
  );
}
