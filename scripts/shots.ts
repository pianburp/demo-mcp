// npm run shots: screenshots of the demo pages into design/shots/, to compare with design/ref/.
// Needs the dev server running (npm run dev). Run npm run seed first so the pages have data.
import { chromium } from "playwright";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const OUT = "design/shots";

const browser = await chromium.launch();
try {
  const phone = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  await phone.goto(`${BASE}/chat?as=ani`, { waitUntil: "networkidle" });
  await phone.screenshot({ path: `${OUT}/chat.png` });
  // Same chat with text in the box, so the send button shows (like wa-input.png).
  await phone.locator("form input").fill("Nak 2 bekas tart nenas");
  await phone.screenshot({ path: `${OUT}/chat-typed.png` });

  const laptop = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await laptop.goto(`${BASE}/dashboard`, { waitUntil: "networkidle" });
  await laptop.screenshot({ path: `${OUT}/dashboard.png` });
  console.log(`Saved chat.png, chat-typed.png, dashboard.png in ${OUT}/`);
} finally {
  await browser.close();
}
