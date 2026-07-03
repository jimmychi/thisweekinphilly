import React from "react";
import EventCard from "./EventCard.jsx";
import { groupEventsByDate, getDayLabel } from "../utils/dates.js";

const styles = {
  wrap: {
    maxWidth: 1400,
    margin: "0 auto",
    padding: "32px 24px 64px",
  },
  section: {
    marginBottom: 48,
  },
  dayHeader: {
    display: "flex",
    alignItems: "center",
    gap: 16,
    marginBottom: 16,
  },
  dayLabel: {
    fontFamily: "var(--font-body)",
    fontSize: "1.4rem",
    fontWeight: 600,
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
  list: {
    display: "flex",
    flexDirection: "column",
    border: "1px solid var(--border)",
    borderRadius: 8,
    overflow: "hidden",
    background: "var(--warm-white)",
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
    height: 56,
  },
};

function Skeleton() {
  return (
    <div style={styles.wrap}>
      <div style={{ marginBottom: 40 }}>
        <div style={{ ...styles.skeleton, height: 28, width: 160, marginBottom: 12 }} />
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} style={{ ...styles.skeleton, animationDelay: `${i * 0.1}s` }} />
          ))}
        </div>
      </div>
    </div>
  );
}

function useIsDesktop() {
  const [isDesktop, setIsDesktop] = React.useState(window.innerWidth >= 768);
  React.useEffect(() => {
    const handler = () => setIsDesktop(window.innerWidth >= 768);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);
  return isDesktop;
}

export default function EventGrid({ events, loading, error }) {
  const isDesktop = useIsDesktop();

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
      {sortedDates.map((date) => (
        <section key={date} style={styles.section}>
          <div style={styles.dayHeader}>
            <h2 style={styles.dayLabel}>{getDayLabel(date)}</h2>
            <div style={styles.dayLine} />
            <span style={styles.count}>{groups[date].length} event{groups[date].length !== 1 ? "s" : ""}</span>
          </div>
          {isDesktop ? (
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: 20,
            }}>
              {groups[date].map((event) => (
                <EventCard key={event.id} event={event} isDesktop={true} />
              ))}
            </div>
          ) : (
            <div style={styles.list}>
              {groups[date].map((event, i) => (
                <EventCard key={event.id} event={event} isLast={i === groups[date].length - 1} />
              ))}
            </div>
          )}
        </section>
      ))}
    </main>
  );
}
