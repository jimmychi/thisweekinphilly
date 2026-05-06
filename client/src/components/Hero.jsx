import React, { useState, useEffect } from "react";

const PHILLY_PHOTOS = [
  {
    url: "https://images.unsplash.com/photo-1601332069598-7efd9e8de7fd?w=1600&q=80",
    caption: "Philadelphia City Hall"
  },
  {
    url: "https://images.unsplash.com/photo-1569761316261-9a8696fa2ca3?w=1600&q=80",
    caption: "Rocky Steps at the Philadelphia Museum of Art"
  },
  {
    url: "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=1600&q=80",
    caption: "Philadelphia Skyline"
  },
  {
    url: "https://images.unsplash.com/photo-1575931953324-1b1c6a015aa4?w=1600&q=80",
    caption: "Liberty Bell"
  },
  {
    url: "https://images.unsplash.com/photo-1581351721010-8cf859cb14c2?w=1600&q=80",
    caption: "South Street"
  },
  {
    url: "https://images.unsplash.com/photo-1617839625591-e5a789593135?w=1600&q=80",
    caption: "Boathouse Row"
  },
];

const styles = {
  hero: {
    position: "relative",
    height: 380,
    overflow: "hidden",
  },
  slide: (url) => ({
    position: "absolute",
    inset: 0,
    backgroundImage: `url(${url})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    transition: "opacity 1.5s ease-in-out",
  }),
  overlay: {
    position: "absolute",
    inset: 0,
    background: "linear-gradient(to bottom, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.65) 100%)",
  },
  content: {
    position: "relative",
    zIndex: 2,
    height: "100%",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    padding: "0 48px",
    maxWidth: 1200,
    margin: "0 auto",
  },
  headline: {
    fontFamily: "var(--font-display)",
    fontSize: "clamp(2rem, 5vw, 3.5rem)",
    fontWeight: 900,
    color: "#fff",
    lineHeight: 1.1,
    marginBottom: 12,
    textShadow: "0 2px 8px rgba(0,0,0,0.4)",
  },
  accent: {
    color: "var(--brick)",
  },
  sub: {
    fontFamily: "var(--font-body)",
    fontStyle: "italic",
    fontSize: "1.1rem",
    color: "rgba(255,255,255,0.9)",
    textShadow: "0 1px 4px rgba(0,0,0,0.4)",
    marginBottom: 24,
  },
  dots: {
    position: "absolute",
    bottom: 16,
    left: "50%",
    transform: "translateX(-50%)",
    display: "flex",
    gap: 8,
    zIndex: 3,
  },
  dot: (active) => ({
    width: active ? 24 : 8,
    height: 8,
    borderRadius: 4,
    background: active ? "var(--brick)" : "rgba(255,255,255,0.5)",
    transition: "all 0.3s ease",
    cursor: "pointer",
    border: "none",
    padding: 0,
  }),
  caption: {
    position: "absolute",
    bottom: 48,
    right: 24,
    fontFamily: "var(--font-body)",
    fontSize: "0.7rem",
    color: "rgba(255,255,255,0.6)",
    fontStyle: "italic",
    zIndex: 3,
    letterSpacing: "0.05em",
  },
};

export default function Hero() {
  const [current, setCurrent] = useState(0);
  const [prev, setPrev] = useState(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setPrev(current);
      setCurrent((c) => (c + 1) % PHILLY_PHOTOS.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [current]);

  return (
    <div style={styles.hero}>
      {PHILLY_PHOTOS.map((photo, i) => (
        <div
          key={i}
          style={{
            ...styles.slide(photo.url),
            opacity: i === current ? 1 : 0,
          }}
        />
      ))}
      <div style={styles.overlay} />
      <div style={styles.content}>
        <h1 style={styles.headline}>
          What's Happening<br />
          <span style={styles.accent}>This Week</span>
        </h1>
        <p style={styles.sub}>
          Philly concerts, food, arts, sports & community events.
        </p>
      </div>
      <div style={styles.caption}>
        {PHILLY_PHOTOS[current].caption}
      </div>
      <div style={styles.dots}>
        {PHILLY_PHOTOS.map((_, i) => (
          <button
            key={i}
            style={styles.dot(i === current)}
            onClick={() => setCurrent(i)}
          />
        ))}
      </div>
    </div>
  );
}
