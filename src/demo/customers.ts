// Fake customers for the demo chat (S3: not real people). The banner already says the data is fake.
// slug picks the customer in the chat URL: /chat?as=ani
export const CUSTOMERS = [
  { id: "c1", slug: "ani", name: "Kak Ani" },
  { id: "c2", slug: "badrul", name: "En. Badrul" },
  { id: "c3", slug: "siti", name: "Siti" },
] as const;
