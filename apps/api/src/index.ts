import Fastify from "fastify";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import rateLimit from "@fastify/rate-limit";
import jwt from "@fastify/jwt";
import multipart from "@fastify/multipart";
import fastifyStatic from "@fastify/static";
import * as path from "path";
import { fileURLToPath } from "url";
import { authRoutes } from "./routes/auth.js";
import { wantedAdsRoutes } from "./routes/wanted-ads.js";
import { propertiesRoutes } from "./routes/properties.js";
import { matchesRoutes } from "./routes/matches.js";
import { inquiriesRoutes } from "./routes/inquiries.js";
import { notificationsRoutes } from "./routes/notifications.js";
import { savedSearchesRoutes } from "./routes/saved-searches.js";
import { healthRoutes } from "./routes/health.js";
import { adminRoutes } from "./routes/admin.js";
import { uploadsRoutes } from "./routes/uploads.js";
import { billingRoutes } from "./routes/billing.js";
import { webhooksRoutes } from "./routes/webhooks.js";
import { postcardsRoutes } from "./routes/postcards.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const server = Fastify({
  logger: {
    level: process.env.LOG_LEVEL || "info",
    transport:
      process.env.NODE_ENV === "development"
        ? {
            target: "pino-pretty",
            options: { colorize: true },
          }
        : undefined,
  },
});

// Add raw body support for webhook signature verification
server.addContentTypeParser(
  "application/json",
  { parseAs: "string" },
  (req, body, done) => {
    try {
      // Store raw body for webhook verification
      (req as any).rawBody = body;
      const json = JSON.parse(body as string);
      done(null, json);
    } catch (err) {
      done(err as Error, undefined);
    }
  }
);

// Plugins
await server.register(cors, {
  origin: process.env.CORS_ORIGIN || "http://localhost:3000",
  credentials: true,
});

await server.register(helmet);

await server.register(rateLimit, {
  max: 100,
  timeWindow: "1 minute",
});

await server.register(jwt, {
  secret: process.env.JWT_SECRET || "development-secret-change-in-production",
});

// Multipart for file uploads
await server.register(multipart, {
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
    files: 10,
  },
});

// Serve static files for local uploads (development only)
if (process.env.NODE_ENV !== "production") {
  const uploadsDir = process.env.LOCAL_UPLOAD_DIR || path.join(__dirname, "../uploads");
  await server.register(fastifyStatic, {
    root: uploadsDir,
    prefix: "/uploads/",
    decorateReply: false,
  });
}

// Auth hook for protected routes
server.decorate(
  "authenticate",
  async function (request: any, reply: any) {
    try {
      await request.jwtVerify();
    } catch {
      reply.status(401).send({ error: "Unauthorized" });
    }
  }
);

// Routes
await server.register(healthRoutes, { prefix: "/api" });
await server.register(authRoutes, { prefix: "/api/auth" });
await server.register(wantedAdsRoutes, { prefix: "/api/wanted-ads" });
await server.register(propertiesRoutes, { prefix: "/api/properties" });
await server.register(matchesRoutes, { prefix: "/api/matches" });
await server.register(inquiriesRoutes, { prefix: "/api/inquiries" });
await server.register(notificationsRoutes, { prefix: "/api/notifications" });
await server.register(savedSearchesRoutes, { prefix: "/api/saved-searches" });
await server.register(adminRoutes, { prefix: "/api/admin" });
await server.register(uploadsRoutes, { prefix: "/api/uploads" });
await server.register(billingRoutes, { prefix: "/api/billing" });
await server.register(webhooksRoutes, { prefix: "/api/webhooks" });
await server.register(postcardsRoutes, { prefix: "/api/postcards" });

// Start server
const start = async () => {
  try {
    const port = parseInt(process.env.PORT || "4000", 10);
    const host = process.env.HOST || "0.0.0.0";

    await server.listen({ port, host });
    console.log(`API server running at http://${host}:${port}`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();

export { server };
