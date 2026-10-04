const express = require("express");
const { chromium } = require("playwright");
const fs = require("fs");

const app = express();
app.use(express.json());
app.use(express.static("public"));

function sessionExists() {
  return fs.existsSync("smartflow-session.json");
}

app.get("/api/status", (req, res) => {
  res.json({
    sessionSaved: sessionExists(),
    message: sessionExists()
      ? "SmartFlow session is available."
      : "Run npm run setup first."
  });
});

app.post("/api/check", async (req, res) => {
  const { name, phone } = req.body || {};
  if (!name || !phone) {
    return res.status(400).json({ error: "Name and phone are required." });
  }

  if (!sessionExists()) {
    return res.status(503).json({
      error: "SmartFlow session is not configured. Run npm run setup first."
    });
  }

  // IMPORTANT:
  // The exact SmartFlow report URL and selectors are intentionally NOT guessed.
  // They must be discovered from the real logged-in page first.
  return res.status(501).json({
    error: "Connection test is ready, but the real Report search selectors have not been configured yet.",
    received: { name, phone },
    nextStep: "Configure the exact Report page URL and fields after the first successful setup."
  });
});

app.listen(3000, () => {
  console.log("Cellix SmartFlow test running at http://localhost:3000");
});
