import React, { useState } from "react";
import Header from "./components/Header.jsx";
import Hero from "./components/Hero.jsx";
import CategoryBar from "./components/CategoryBar.jsx";
import EventGrid from "./components/EventGrid.jsx";
import Footer from "./components/Footer.jsx";
import { useEvents, useCategories } from "./hooks/useEvents.js";

export default function App() {
  const [activeCategory, setActiveCategory] = useState("all");
  const categories = useCategories();
  const { events, loading, error, lastUpdated } = useEvents(activeCategory, 7);

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Header lastUpdated={lastUpdated} />
      <Hero eventCount={events.length} loading={loading} />
      <CategoryBar
        categories={categories}
        activeCategory={activeCategory}
        onSelect={setActiveCategory}
      />
      <div style={{ flex: 1, background: "var(--cream)" }}>
        <EventGrid events={events} loading={loading} error={error} />
      </div>
      <Footer lastUpdated={lastUpdated} />
    </div>
  );
}
