// Prints the address to open /chat on a phone on the same Wi-Fi (next dev only shows 0.0.0.0).
import { networkInterfaces } from "node:os";

const ips = Object.values(networkInterfaces())
  .flat()
  .filter((a) => a && a.family === "IPv4" && !a.internal)
  .map((a) => a!.address);
for (const ip of ips) console.log(`Phone: http://${ip}:3000/chat?as=siti`);
if (!ips.length) console.log("Phone: no network found. Connect to Wi-Fi first.");
