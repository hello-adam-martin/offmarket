import type { FastifyInstance } from "fastify";
import { db } from "@offmarket/database";

export async function notificationsRoutes(server: FastifyInstance) {
  // Get my notifications (protected)
  server.get(
    "/",
    { preHandler: [(server as any).authenticate] },
    async (request, reply) => {
      const { sub: userId } = request.user as { sub: string };
      const { limit = "20", offset = "0", unreadOnly = "false" } = request.query as Record<string, string>;

      try {
        const where = {
          userId,
          ...(unreadOnly === "true" ? { isRead: false } : {}),
        };

        const [notifications, total, unreadCount] = await Promise.all([
          db.notification.findMany({
            where,
            orderBy: { createdAt: "desc" },
            take: parseInt(limit),
            skip: parseInt(offset),
          }),
          db.notification.count({ where }),
          db.notification.count({ where: { userId, isRead: false } }),
        ]);

        return {
          success: true,
          data: {
            notifications,
            total,
            unreadCount,
          },
        };
      } catch (error) {
        server.log.error(error);
        return reply.status(500).send({
          success: false,
          error: { code: "SERVER_ERROR", message: "Failed to fetch notifications" },
        });
      }
    }
  );

  // Get unread count only (for header badge)
  server.get(
    "/unread-count",
    { preHandler: [(server as any).authenticate] },
    async (request, reply) => {
      const { sub: userId } = request.user as { sub: string };

      try {
        const count = await db.notification.count({
          where: { userId, isRead: false },
        });

        return { success: true, data: { count } };
      } catch (error) {
        server.log.error(error);
        return reply.status(500).send({
          success: false,
          error: { code: "SERVER_ERROR", message: "Failed to fetch unread count" },
        });
      }
    }
  );

  // Mark notification as read
  server.patch(
    "/:id/read",
    { preHandler: [(server as any).authenticate] },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const { sub: userId } = request.user as { sub: string };

      try {
        const notification = await db.notification.findUnique({ where: { id } });

        if (!notification) {
          return reply.status(404).send({
            success: false,
            error: { code: "NOT_FOUND", message: "Notification not found" },
          });
        }

        if (notification.userId !== userId) {
          return reply.status(403).send({
            success: false,
            error: { code: "FORBIDDEN", message: "Not authorized" },
          });
        }

        const updated = await db.notification.update({
          where: { id },
          data: { isRead: true },
        });

        return { success: true, data: updated };
      } catch (error) {
        server.log.error(error);
        return reply.status(500).send({
          success: false,
          error: { code: "SERVER_ERROR", message: "Failed to mark notification as read" },
        });
      }
    }
  );

  // Mark all notifications as read
  server.patch(
    "/read-all",
    { preHandler: [(server as any).authenticate] },
    async (request, reply) => {
      const { sub: userId } = request.user as { sub: string };

      try {
        await db.notification.updateMany({
          where: { userId, isRead: false },
          data: { isRead: true },
        });

        return { success: true, data: { marked: true } };
      } catch (error) {
        server.log.error(error);
        return reply.status(500).send({
          success: false,
          error: { code: "SERVER_ERROR", message: "Failed to mark notifications as read" },
        });
      }
    }
  );

  // Delete a notification
  server.delete(
    "/:id",
    { preHandler: [(server as any).authenticate] },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const { sub: userId } = request.user as { sub: string };

      try {
        const notification = await db.notification.findUnique({ where: { id } });

        if (!notification) {
          return reply.status(404).send({
            success: false,
            error: { code: "NOT_FOUND", message: "Notification not found" },
          });
        }

        if (notification.userId !== userId) {
          return reply.status(403).send({
            success: false,
            error: { code: "FORBIDDEN", message: "Not authorized" },
          });
        }

        await db.notification.delete({ where: { id } });

        return { success: true, data: { deleted: true } };
      } catch (error) {
        server.log.error(error);
        return reply.status(500).send({
          success: false,
          error: { code: "SERVER_ERROR", message: "Failed to delete notification" },
        });
      }
    }
  );
}
