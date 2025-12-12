import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { db } from "@offmarket/database";

const registerSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2).optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
});

const updateProfileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  phone: z.string().max(20).optional(),
});

export async function authRoutes(server: FastifyInstance) {
  // Register a new user (or return existing)
  server.post("/register", async (request, reply) => {
    const body = registerSchema.safeParse(request.body);
    if (!body.success) {
      return reply.status(400).send({
        success: false,
        error: { code: "VALIDATION_ERROR", message: body.error.message },
      });
    }

    const { email, name } = body.data;

    try {
      let user = await db.user.findUnique({ where: { email } });

      if (!user) {
        user = await db.user.create({
          data: { email, name },
        });
      }

      const token = server.jwt.sign(
        { sub: user.id, email: user.email },
        { expiresIn: "7d" }
      );

      return {
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          },
          token,
        },
      };
    } catch (error) {
      server.log.error(error);
      return reply.status(500).send({
        success: false,
        error: { code: "SERVER_ERROR", message: "Failed to register user" },
      });
    }
  });

  // Login (generate token for existing user)
  server.post("/login", async (request, reply) => {
    const body = loginSchema.safeParse(request.body);
    if (!body.success) {
      return reply.status(400).send({
        success: false,
        error: { code: "VALIDATION_ERROR", message: body.error.message },
      });
    }

    const { email } = body.data;

    try {
      const user = await db.user.findUnique({ where: { email } });

      if (!user) {
        return reply.status(404).send({
          success: false,
          error: { code: "USER_NOT_FOUND", message: "User not found" },
        });
      }

      const token = server.jwt.sign(
        { sub: user.id, email: user.email },
        { expiresIn: "7d" }
      );

      return {
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          },
          token,
        },
      };
    } catch (error) {
      server.log.error(error);
      return reply.status(500).send({
        success: false,
        error: { code: "SERVER_ERROR", message: "Failed to login" },
      });
    }
  });

  // Get current user (protected route)
  server.get(
    "/me",
    { preHandler: [(server as any).authenticate] },
    async (request, reply) => {
      try {
        const { sub: userId } = request.user as { sub: string };

        const user = await db.user.findUnique({
          where: { id: userId },
          include: {
            buyerProfile: true,
            ownerProfile: true,
          },
        });

        if (!user) {
          return reply.status(404).send({
            success: false,
            error: { code: "USER_NOT_FOUND", message: "User not found" },
          });
        }

        return {
          success: true,
          data: {
            id: user.id,
            email: user.email,
            name: user.name,
            phone: user.phone,
            image: user.image,
            role: user.role,
            hasBuyerProfile: !!user.buyerProfile,
            hasOwnerProfile: !!user.ownerProfile,
          },
        };
      } catch (error) {
        server.log.error(error);
        return reply.status(500).send({
          success: false,
          error: { code: "SERVER_ERROR", message: "Failed to get user" },
        });
      }
    }
  );

  // Update current user profile (protected route)
  server.patch(
    "/me",
    { preHandler: [(server as any).authenticate] },
    async (request, reply) => {
      const body = updateProfileSchema.safeParse(request.body);
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
        const { sub: userId } = request.user as { sub: string };
        const data = body.data;

        const user = await db.user.update({
          where: { id: userId },
          data: {
            ...(data.name !== undefined && { name: data.name }),
            ...(data.phone !== undefined && { phone: data.phone }),
          },
          include: {
            buyerProfile: true,
            ownerProfile: true,
          },
        });

        return {
          success: true,
          data: {
            id: user.id,
            email: user.email,
            name: user.name,
            phone: user.phone,
            image: user.image,
            hasBuyerProfile: !!user.buyerProfile,
            hasOwnerProfile: !!user.ownerProfile,
          },
        };
      } catch (error) {
        server.log.error(error);
        return reply.status(500).send({
          success: false,
          error: { code: "SERVER_ERROR", message: "Failed to update profile" },
        });
      }
    }
  );
}
