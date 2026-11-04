import { getApp } from "../../../demo/app";

export async function GET(req: Request) {
  const customerId = new URL(req.url).searchParams.get("customerId") ?? "";
  return Response.json(await getApp().chat(customerId));
}
