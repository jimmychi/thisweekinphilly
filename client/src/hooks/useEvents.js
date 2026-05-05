import { useState, useEffect, useCallback } from "react";

const API_BASE = import.meta.env.VITE_API_URL || "/api";

export function useEvents(category, days = 7) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ days });
      if (category && category !== "all") params.set("category", category);
      const res = await fetch(`${API_BASE}/events?${params}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setEvents(data.events || []);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [category, days]);

  useEffect(() => {
    fetchEvents();
    // Auto-refresh every 15 minutes
    const interval = setInterval(fetchEvents, 15 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchEvents]);

  return { events, loading, error, lastUpdated, refetch: fetchEvents };
}

export function useCategories() {
  const [categories, setCategories] = useState([]);
  useEffect(() => {
    fetch(`${API_BASE}/events/categories`)
      .then((r) => r.json())
      .then((d) => setCategories(d.categories || []))
      .catch(() => {});
  }, []);
  return categories;
}
