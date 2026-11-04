import { ApproveSchema, getApp } from "../../../demo/app";

// Owner taps Lulus on /dashboard. The only path to a reply in the chat (S1).
export async function POST(req: Request) {
  const body = ApproveSchema.safeParse(await req.json().catch(() => null));
  if (!body.success) return Response.json({ error: "bad request" }, { status: 400 });
  const order = await getApp().approve(body.data);
  if (!order) return Response.json({ error: "not found or already sent" }, { status: 409 });
  return Response.json(order);
}
