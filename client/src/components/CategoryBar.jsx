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
    padding: "12px 0",
  },
  btn: (active) => ({
    display: "flex",
    alignItems: "center",
    gap: 6,
    padding: "7px 16px",
    borderRadius: 40,
    border: active ? "1.5px solid var(--brick)" : "1.5px solid var(--border)",
    background: active ? "var(--brick)" : "transparent",
    color: active ? "#fff" : "var(--ink-soft)",
    fontFamily: "var(--font-body)",
    fontSize: "0.85rem",
    fontWeight: active ? 600 : 400,
    whiteSpace: "nowrap",
    transition: "all 0.2s ease",
    cursor: "pointer",
  }),
};

export default function CategoryBar({ categories, activeCategory, onSelect, freeOnly, onFreeToggle }) {
  return (
    <nav style={styles.bar}>
      <div style={styles.inner}>
        {categories.map((cat) => (
          <button
            key={cat.id}
            style={styles.btn(activeCategory === cat.id)}
            onClick={() => onSelect(cat.id)}
          >
            <span>{cat.emoji}</span>
            <span>{cat.label}</span>
          </button>
        ))}
        {onFreeToggle && <button
          style={styles.btn(freeOnly)}
          onClick={onFreeToggle}
        >
          <span>🎟️</span>
          <span>Free Events</span>
        </button>}
      </div>
    </nav>
  );
}
