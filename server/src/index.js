require("dotenv").config();
const express = require("express");
const cors = require("cors");
const eventsRouter = require("./routes/events");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: process.env.CLIENT_URL || "*",
}));
app.use(express.json());

// Health check
app.get("/health", (req, res) => res.json({ status: "ok", time: new Date() }));

// Routes
app.use("/api/events", eventsRouter);

app.listen(PORT, () => {
  console.log(`🏙️  This Week in Philly server running on port ${PORT}`);
});
