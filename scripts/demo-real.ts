// npm run demo:real: starts the app with RealModel. Every chat message is one paid Claude call (S6).
import { spawn } from "node:child_process";

console.warn(`
  *** AMARAN: RealModel ***
  Setiap mesej di /chat dihantar ke Claude (claude-opus-5-5) dan KOS DUIT.
  Perlu ANTHROPIC_API_KEY dalam .env.local. Tekan Ctrl+C untuk berhenti.
`);

spawn("npx next dev", { stdio: "inherit", shell: true, env: { ...process.env, MODEL: "real" } }).on("exit", (code) =>
  process.exit(code ?? 0),
);
