import React, { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from "./components/Header.jsx";
import Hero from "./components/Hero.jsx";
import CategoryBar from "./components/CategoryBar.jsx";
import EventGrid from "./components/EventGrid.jsx";
import Footer from "./components/Footer.jsx";
import EventDetail from "./pages/EventDetail.jsx";
import SubmitEvent from "./pages/SubmitEvent.jsx";
import { useEvents, useCategories } from "./hooks/useEvents.js";
import DayBar from "./components/DayBar.jsx";
import Restaurants from "./pages/Restaurants.jsx";
import RestaurantDetail from "./pages/RestaurantDetail.jsx";
import Privacy from "./pages/Privacy.jsx";
import Bars from "./pages/Bars.jsx";
import Nightclubs from "./pages/Nightclubs.jsx";
import HappyHours from "./pages/HappyHours.jsx";
import Museums from "./pages/Museums.jsx";
import ScrollToTop from "./components/ScrollToTop.jsx";

function HomePage() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [activeDay, setActiveDay] = useState(null);
  const [freeOnly, setFreeOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
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
        freeOnly={freeOnly}
        onFreeToggle={() => { setFreeOnly(prev => !prev); }}
      />
      <div style={{ background: "var(--warm-white)", borderBottom: "1px solid var(--border)", padding: "10px 24px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <input
            type="text"
            placeholder="🔍 Search events, venues..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{ width: "100%", padding: "8px 16px", borderRadius: 40, border: "1.5px solid var(--border)", fontFamily: "var(--font-body)", fontSize: "0.9rem", background: "var(--cream)", outline: "none", boxSizing: "border-box" }}
          />
        </div>
      </div>
      <DayBar activeDay={activeDay} onSelect={setActiveDay} />
      <div style={{ flex: 1, background: "var(--cream)" }}>
        <EventGrid events={(activeDay ? events.filter(e => e.date === activeDay) : events).filter(e => !freeOnly || !e.price || e.price === "0" || (e.price && e.price.toLowerCase().includes("free"))).filter(e => !searchQuery || e.title?.toLowerCase().includes(searchQuery.toLowerCase()) || e.venue?.toLowerCase().includes(searchQuery.toLowerCase()) || e.description?.toLowerCase().includes(searchQuery.toLowerCase()))} loading={loading} error={error} />
      </div>
      <Footer lastUpdated={lastUpdated} />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/event/:id" element={<EventDetail />} />
        <Route path="/submit" element={<SubmitEvent />} />
        <Route path="/restaurants" element={<Restaurants />} />
        <Route path="/restaurants/:id" element={<RestaurantDetail />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/bars" element={<Bars />} />
        <Route path="/nightclubs" element={<Nightclubs />} />
        <Route path="/happyhours" element={<HappyHours />} />
        <Route path="/museums" element={<Museums />} />
      </Routes>
    </BrowserRouter>
  );
}