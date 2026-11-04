// npm run demo:real: starts the app with RealModel. Every chat message is one paid Gemini call (S6).
import { spawn } from "node:child_process";
import "./phone-url";

console.warn(`
  *** AMARAN: RealModel ***
  Setiap mesej di /chat dihantar ke Gemini (gemini-3.8-flash) dan KOS DUIT.
  Perlu GEMINI_API_KEY dalam .env.local. Tekan Ctrl+C untuk berhenti.
`);

spawn("npx next dev -H 0.0.0.0", { stdio: "inherit", shell: true, env: { ...process.env, MODEL: "real" } }).on("exit", (code) =>
  process.exit(code ?? 0),
);
