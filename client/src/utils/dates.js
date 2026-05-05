export function formatDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr + "T12:00:00"); // prevent tz shift
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

export function formatTime(timeStr) {
  if (!timeStr) return "";
  const [h, m] = timeStr.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${hour}:${m.toString().padStart(2, "0")} ${period}`;
}

export function isToday(dateStr) {
  if (!dateStr) return false;
  const today = new Date().toISOString().split("T")[0];
  return dateStr === today;
}

export function isTomorrow(dateStr) {
  if (!dateStr) return false;
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return dateStr === tomorrow.toISOString().split("T")[0];
}

export function getDayLabel(dateStr) {
  if (isToday(dateStr)) return "Today";
  if (isTomorrow(dateStr)) return "Tomorrow";
  return formatDate(dateStr);
}

export function groupEventsByDate(events) {
  const groups = {};
  for (const event of events) {
    const key = event.date || "unknown";
    if (!groups[key]) groups[key] = [];
    groups[key].push(event);
  }
  return groups;
}
