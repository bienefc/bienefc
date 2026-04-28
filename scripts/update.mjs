import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const README_PATH = path.join(__dirname, "../README.md");

// ─── Helpers ────────────────────────────────────────────────────────────────

function injectSection(content, tag, newBlock) {
  const start = `<!-- ${tag}:START -->`;
  const end = `<!-- ${tag}:END -->`;
  const regex = new RegExp(`${start}[\\s\\S]*?${end}`, "g");
  return content.replace(regex, `${start}\n${newBlock}\n${end}`);
}

function pad(n) {
  return String(n).padStart(2, "0");
}

function formatDate(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

// ─── GitHub Stats Block ──────────────────────────────────────────────────────

function buildStatsBlock() {
  const username = process.env.GITHUB_ACTOR || "bienefc";
  const lastUpdated = new Date().toUTCString();

  return `<!-- Last updated: ${lastUpdated} -->
[![GitHub Streak](https://streak-stats.demolab.com?user=${username}&theme=dark&hide_border=true)](https://git.io/streak-stats)
![Top Langs](https://github-readme-stats.vercel.app/api/top-langs/?username=${username}&layout=compact&theme=dark&hide_border=true)`;
}

// ─── Weather Block ───────────────────────────────────────────────────────────

async function buildWeatherBlock() {
  try {
    // Uses wttr.in — no API key needed
    const city = process.env.WEATHER_CITY || "Kuala+Lumpur";
    const res = await fetch(`https://wttr.in/${city}?format=j1`);
    const data = await res.json();
    const current = data.current_condition[0];
    const desc = current.weatherDesc[0].value;
    const tempC = current.temp_C;
    const humidity = current.humidity;
    const date = formatDate(new Date());

    return `> 🌤️ **${city.replace("+", " ")} weather on ${date}:** ${desc}, ${tempC}°C, humidity ${humidity}%`;
  } catch {
    return `> 🌤️ Weather unavailable today.`;
  }
}

// ─── Quote Block ─────────────────────────────────────────────────────────────

async function buildQuoteBlock() {
  try {
    const res = await fetch("https://zenquotes.io/api/today");
    const [quote] = await res.json();
    return `> 💬 *"${quote.q}"* — **${quote.a}**`;
  } catch {
    return `> 💬 *"Code is like humor. When you have to explain it, it's bad."* — Cory House`;
  }
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  console.log("📝 Reading README...");
  let content = fs.readFileSync(README_PATH, "utf-8");

  console.log("📊 Building stats block...");
  content = injectSection(content, "STATS", buildStatsBlock());

  console.log("🌤️  Fetching weather...");
  content = injectSection(content, "WEATHER", await buildWeatherBlock());

  console.log("💬 Fetching quote...");
  content = injectSection(content, "QUOTE", await buildQuoteBlock());

  fs.writeFileSync(README_PATH, content, "utf-8");
  console.log("✅ README updated successfully!");
}

main().catch((err) => {
  console.error("❌ Update failed:", err);
  process.exit(1);
});
