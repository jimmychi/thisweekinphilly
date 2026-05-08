import React from "react";

const styles = {
  bar: {
    background: "var(--warm-white)",
    borderBottom: "1px solid var(--border)",
    padding: "0 24px",
    overflowX: "auto",
  },
  inner: {
    maxWidth: 1200,
    margin: "0 auto",
    display: "flex",
    gap: 4,
    padding: "10px 0",
  },
  btn: (active) => ({
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "6px 14px",
    borderRadius: 40,
    border: active ? "1.5px solid var(--brick)" : "1.5px solid var(--border)",
    background: active ? "var(--brick)" : "transparent",
    color: active ? "#fff" : "var(--ink-soft)",
    fontFamily: "var(--font-body)",
    fontSize: "0.8rem",
    fontWeight: active ? 600 : 400,
    whiteSpace: "nowrap",
    transition: "all 0.2s ease",
    cursor: "pointer",
    minWidth: 48,
  }),
  dayName: {
    fontSize: "0.7rem",
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  },
  dayNum: {
    fontSize: "1rem",
    fontWeight: 700,
    lineHeight: 1.2,
  },
};

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function DayBar({ activeDay, onSelect }) {
  const days = [];
  const today = new Date();

  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const dateStr = d.toISOString().split("T")[0];
    days.push({
      dateStr,
      dayName: DAY_NAMES[d.getDay()],
      dayNum: d.getDate(),
      isToday: i === 0,
    });
  }

  return (
    <nav style={styles.bar}>
      <div style={styles.inner}>
        <button
          style={styles.btn(!activeDay)}
          onClick={() => onSelect(null)}
        >
          <span style={styles.dayName}>All</span>
          <span style={styles.dayNum}>Days</span>
        </button>
        {days.map((d) => (
          <button
            key={d.dateStr}
            style={styles.btn(activeDay === d.dateStr)}
            onClick={() => onSelect(d.dateStr)}
          >
            <span style={styles.dayName}>{d.isToday ? "Today" : d.dayName}</span>
            <span style={styles.dayNum}>{d.dayNum}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
