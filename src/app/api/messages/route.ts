import { getApp, SendSchema } from "../../../demo/app";

// Customer sends a message from /chat.
export async function POST(req: Request) {
  const body = SendSchema.safeParse(await req.json().catch(() => null));
  if (!body.success) return Response.json({ error: "bad request" }, { status: 400 });
  const order = await getApp().receive(body.data);
  return Response.json({ id: order.id }, { status: 201 });
}
