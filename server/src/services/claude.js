const Anthropic = require("@anthropic-ai/sdk");

const client = new Anthropic.Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

async function generateEventDescription(title, category, venue, date) {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.warn("ANTHROPIC_API_KEY not set");
    return null;
  }

  try {
    const prompt = `Write a 2-3 sentence description for this Philadelphia event. Be specific, engaging, and informative. Do not make up specific details like prices or times.

Event: ${title}
Category: ${category}
Venue: ${venue || "Philadelphia"}
Date: ${date || "this week"}

Write only the description, nothing else.`;

    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 150,
      messages: [{ role: "user", content: prompt }],
    });

    return message.content[0].text.trim() || null;
  } catch (err) {
    console.error("Claude description error:", err.message);
    return null;
  }
}

module.exports = { generateEventDescription };
