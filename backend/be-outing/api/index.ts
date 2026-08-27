import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getServer } from "../src/server";

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  const server = await getServer();

  server(req, res);
}
