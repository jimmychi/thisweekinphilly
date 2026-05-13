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
  btn: (active, small) => ({
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: small ? "4px 8px" : "6px 14px",
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
    minWidth: small ? 36 : 48,
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
  dayNameSm: {
    fontSize: "0.55rem",
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  },
  dayNumSm: {
    fontSize: "0.85rem",
    fontWeight: 700,
    lineHeight: 1.2,
  },
};

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function DayBar({ activeDay, onSelect }) {
  const isMobile = window.innerWidth < 640;
  const days = [];
  const today = new Date();

  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const dateStr = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
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
          style={styles.btn(!activeDay, isMobile)}
          onClick={() => onSelect(null)}
        >
          <span style={isMobile ? styles.dayNameSm : styles.dayName}>This</span>
          <span style={isMobile ? styles.dayNumSm : styles.dayNum}>Week</span>
        </button>
        {days.map((d) => (
          <button
            key={d.dateStr}
            style={styles.btn(activeDay === d.dateStr, isMobile)}
            onClick={() => onSelect(d.dateStr)}
          >
            <span style={isMobile ? styles.dayNameSm : styles.dayName}>{d.dayName}</span>
            <span style={isMobile ? styles.dayNumSm : styles.dayNum}>{d.dayNum}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
