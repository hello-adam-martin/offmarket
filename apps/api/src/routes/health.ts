import type { FastifyInstance } from "fastify";
import { db } from "@offmarket/database";

export async function healthRoutes(server: FastifyInstance) {
  server.get("/health", async () => {
    return { status: "ok", timestamp: new Date().toISOString() };
  });

  server.get("/health/db", async (request, reply) => {
    try {
      await db.$queryRaw`SELECT 1`;
      return { status: "ok", database: "connected" };
    } catch {
      reply.status(503);
      return { status: "error", database: "disconnected" };
    }
  });
}
