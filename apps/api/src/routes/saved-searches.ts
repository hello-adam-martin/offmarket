import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { db } from "@offmarket/database";

const createSavedSearchSchema = z.object({
  name: z.string().min(1).max(100),
  type: z.enum(["DEMAND", "PROPERTY"]),
  region: z.string().optional(),
  city: z.string().optional(),
  suburb: z.string().optional(),
  propertyTypes: z.array(z.string()).optional(),
  bedroomsMin: z.number().int().positive().optional(),
  bedroomsMax: z.number().int().positive().optional(),
  budgetMin: z.number().positive().optional(),
  budgetMax: z.number().positive().optional(),
  notifyOnNew: z.boolean().optional(),
});

const updateSavedSearchSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  notifyOnNew: z.boolean().optional(),
});

export async function savedSearchesRoutes(server: FastifyInstance) {
  // Get all saved searches for the current user
  server.get(
    "/",
    { preHandler: [(server as any).authenticate] },
    async (request, reply) => {
      const { sub: userId } = request.user as { sub: string };

      try {
        const savedSearches = await db.savedSearch.findMany({
          where: { userId },
          orderBy: { createdAt: "desc" },
        });

        return {
          success: true,
          data: savedSearches.map((s) => ({
            ...s,
            propertyTypes: s.propertyTypes ? JSON.parse(s.propertyTypes) : [],
          })),
        };
      } catch (error) {
        server.log.error(error);
        return reply.status(500).send({
          success: false,
          error: { code: "SERVER_ERROR", message: "Failed to fetch saved searches" },
        });
      }
    }
  );

  // Get a single saved search
  server.get(
    "/:id",
    { preHandler: [(server as any).authenticate] },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const { sub: userId } = request.user as { sub: string };

      try {
        const savedSearch = await db.savedSearch.findUnique({
          where: { id },
        });

        if (!savedSearch) {
          return reply.status(404).send({
            success: false,
            error: { code: "NOT_FOUND", message: "Saved search not found" },
          });
        }

        if (savedSearch.userId !== userId) {
          return reply.status(403).send({
            success: false,
            error: { code: "FORBIDDEN", message: "Not authorized" },
          });
        }

        return {
          success: true,
          data: {
            ...savedSearch,
            propertyTypes: savedSearch.propertyTypes
              ? JSON.parse(savedSearch.propertyTypes)
              : [],
          },
        };
      } catch (error) {
        server.log.error(error);
        return reply.status(500).send({
          success: false,
          error: { code: "SERVER_ERROR", message: "Failed to fetch saved search" },
        });
      }
    }
  );

  // Create a new saved search
  server.post(
    "/",
    { preHandler: [(server as any).authenticate] },
    async (request, reply) => {
      const body = createSavedSearchSchema.safeParse(request.body);
      if (!body.success) {
        return reply.status(400).send({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid input",
            details: body.error.flatten().fieldErrors,
          },
        });
      }

      const { sub: userId } = request.user as { sub: string };
      const data = body.data;

      try {
        // Check if user already has too many saved searches (limit to 20)
        const existingCount = await db.savedSearch.count({
          where: { userId },
        });

        if (existingCount >= 20) {
          return reply.status(400).send({
            success: false,
            error: {
              code: "LIMIT_EXCEEDED",
              message: "You can only have up to 20 saved searches",
            },
          });
        }

        const savedSearch = await db.savedSearch.create({
          data: {
            userId,
            name: data.name,
            type: data.type,
            region: data.region,
            city: data.city,
            suburb: data.suburb,
            propertyTypes: data.propertyTypes
              ? JSON.stringify(data.propertyTypes)
              : null,
            bedroomsMin: data.bedroomsMin,
            bedroomsMax: data.bedroomsMax,
            budgetMin: data.budgetMin,
            budgetMax: data.budgetMax,
            notifyOnNew: data.notifyOnNew ?? true,
          },
        });

        return reply.status(201).send({
          success: true,
          data: {
            ...savedSearch,
            propertyTypes: savedSearch.propertyTypes
              ? JSON.parse(savedSearch.propertyTypes)
              : [],
          },
        });
      } catch (error) {
        server.log.error(error);
        return reply.status(500).send({
          success: false,
          error: { code: "SERVER_ERROR", message: "Failed to create saved search" },
        });
      }
    }
  );

  // Update a saved search
  server.patch(
    "/:id",
    { preHandler: [(server as any).authenticate] },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const { sub: userId } = request.user as { sub: string };

      const body = updateSavedSearchSchema.safeParse(request.body);
      if (!body.success) {
        return reply.status(400).send({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid input",
            details: body.error.flatten().fieldErrors,
          },
        });
      }

      try {
        const savedSearch = await db.savedSearch.findUnique({
          where: { id },
        });

        if (!savedSearch) {
          return reply.status(404).send({
            success: false,
            error: { code: "NOT_FOUND", message: "Saved search not found" },
          });
        }

        if (savedSearch.userId !== userId) {
          return reply.status(403).send({
            success: false,
            error: { code: "FORBIDDEN", message: "Not authorized" },
          });
        }

        const data = body.data;
        const updated = await db.savedSearch.update({
          where: { id },
          data: {
            ...(data.name !== undefined && { name: data.name }),
            ...(data.notifyOnNew !== undefined && { notifyOnNew: data.notifyOnNew }),
          },
        });

        return {
          success: true,
          data: {
            ...updated,
            propertyTypes: updated.propertyTypes
              ? JSON.parse(updated.propertyTypes)
              : [],
          },
        };
      } catch (error) {
        server.log.error(error);
        return reply.status(500).send({
          success: false,
          error: { code: "SERVER_ERROR", message: "Failed to update saved search" },
        });
      }
    }
  );

  // Delete a saved search
  server.delete(
    "/:id",
    { preHandler: [(server as any).authenticate] },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const { sub: userId } = request.user as { sub: string };

      try {
        const savedSearch = await db.savedSearch.findUnique({
          where: { id },
        });

        if (!savedSearch) {
          return reply.status(404).send({
            success: false,
            error: { code: "NOT_FOUND", message: "Saved search not found" },
          });
        }

        if (savedSearch.userId !== userId) {
          return reply.status(403).send({
            success: false,
            error: { code: "FORBIDDEN", message: "Not authorized" },
          });
        }

        await db.savedSearch.delete({ where: { id } });

        return { success: true, data: { deleted: true } };
      } catch (error) {
        server.log.error(error);
        return reply.status(500).send({
          success: false,
          error: { code: "SERVER_ERROR", message: "Failed to delete saved search" },
        });
      }
    }
  );
}
