import React, { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from "./components/Header.jsx";
import Hero from "./components/Hero.jsx";
import CategoryBar from "./components/CategoryBar.jsx";
import EventGrid from "./components/EventGrid.jsx";
import Footer from "./components/Footer.jsx";
import EventDetail from "./pages/EventDetail.jsx";
import { useEvents, useCategories } from "./hooks/useEvents.js";

function HomePage() {
  const [activeCategory, setActiveCategory] = useState("all");
  const categories = useCategories();
  const { events, loading, error, lastUpdated } = useEvents(activeCategory, 7);

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Header lastUpdated={lastUpdated} />
      <Hero />
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

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/event/:id" element={<EventDetail />} />
      </Routes>
    </BrowserRouter>
  );
}