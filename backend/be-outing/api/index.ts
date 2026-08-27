import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getServer } from "../src/server";

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  try {
    const server = await getServer();

    server(req, res);
  } catch (error) {
    console.error("Failed to initialize NestJS:", error);

    if (!res.headersSent) {
      res.status(500).json({
        message: "Failed to initialize server",
      });
    }
  }
}
