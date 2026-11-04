import { getApp } from "../../../demo/app";

export async function GET() {
  return Response.json(await getApp().orders());
}
