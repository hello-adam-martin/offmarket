import type { FastifyInstance } from "fastify";
import { db } from "@offmarket/database";
import { uploadFile, deleteFile, validateImageFile } from "../services/upload.js";

const MAX_FILES = 10;

export async function uploadsRoutes(server: FastifyInstance) {
  // Upload images for a property (protected)
  server.post(
    "/properties/:propertyId/images",
    { preHandler: [(server as any).authenticate] },
    async (request, reply) => {
      const { propertyId } = request.params as { propertyId: string };
      const { sub: userId } = request.user as { sub: string };

      try {
        // Verify property ownership
        const property = await db.property.findUnique({
          where: { id: propertyId },
          include: { owner: true, images: true },
        });

        if (!property) {
          return reply.status(404).send({
            success: false,
            error: { code: "NOT_FOUND", message: "Property not found" },
          });
        }

        const ownerProfile = await db.ownerProfile.findUnique({
          where: { userId },
        });

        if (property.ownerId !== ownerProfile?.id) {
          return reply.status(403).send({
            success: false,
            error: { code: "FORBIDDEN", message: "Not authorized" },
          });
        }

        // Check image count limit
        if (property.images.length >= MAX_FILES) {
          return reply.status(400).send({
            success: false,
            error: {
              code: "LIMIT_EXCEEDED",
              message: `Maximum ${MAX_FILES} images allowed per property`,
            },
          });
        }

        // Process multipart upload
        const parts = request.parts();
        const uploadedImages: Array<{
          id: string;
          url: string;
          filename: string;
          size: number;
          order: number;
          isPrimary: boolean;
        }> = [];

        let order = property.images.length;

        for await (const part of parts) {
          if (part.type !== "file") continue;

          // Get file buffer
          const chunks: Buffer[] = [];
          for await (const chunk of part.file) {
            chunks.push(chunk);
          }
          const buffer = Buffer.concat(chunks);

          // Validate file
          const validation = validateImageFile(part.mimetype, buffer.length);
          if (!validation.valid) {
            return reply.status(400).send({
              success: false,
              error: { code: "INVALID_FILE", message: validation.error },
            });
          }

          // Check remaining slots
          if (property.images.length + uploadedImages.length >= MAX_FILES) {
            break;
          }

          // Upload file
          const result = await uploadFile(buffer, part.filename, part.mimetype);

          // Save to database
          const isPrimary = property.images.length === 0 && uploadedImages.length === 0;
          const image = await db.propertyImage.create({
            data: {
              propertyId,
              url: result.url,
              filename: result.filename,
              size: result.size,
              order: order++,
              isPrimary,
            },
          });

          uploadedImages.push({
            id: image.id,
            url: image.url,
            filename: image.filename,
            size: image.size,
            order: image.order,
            isPrimary: image.isPrimary,
          });
        }

        return {
          success: true,
          data: {
            uploaded: uploadedImages.length,
            images: uploadedImages,
          },
        };
      } catch (error) {
        server.log.error(error);
        return reply.status(500).send({
          success: false,
          error: { code: "SERVER_ERROR", message: "Failed to upload images" },
        });
      }
    }
  );

  // Get property images (protected - owner only)
  server.get(
    "/properties/:propertyId/images",
    { preHandler: [(server as any).authenticate] },
    async (request, reply) => {
      const { propertyId } = request.params as { propertyId: string };
      const { sub: userId } = request.user as { sub: string };

      try {
        const property = await db.property.findUnique({
          where: { id: propertyId },
          include: { owner: true },
        });

        if (!property) {
          return reply.status(404).send({
            success: false,
            error: { code: "NOT_FOUND", message: "Property not found" },
          });
        }

        const ownerProfile = await db.ownerProfile.findUnique({
          where: { userId },
        });

        if (property.ownerId !== ownerProfile?.id) {
          return reply.status(403).send({
            success: false,
            error: { code: "FORBIDDEN", message: "Not authorized" },
          });
        }

        const images = await db.propertyImage.findMany({
          where: { propertyId },
          orderBy: { order: "asc" },
        });

        return {
          success: true,
          data: images.map((img) => ({
            id: img.id,
            url: img.url,
            filename: img.filename,
            size: img.size,
            order: img.order,
            isPrimary: img.isPrimary,
          })),
        };
      } catch (error) {
        server.log.error(error);
        return reply.status(500).send({
          success: false,
          error: { code: "SERVER_ERROR", message: "Failed to fetch images" },
        });
      }
    }
  );

  // Delete a property image (protected)
  server.delete(
    "/properties/:propertyId/images/:imageId",
    { preHandler: [(server as any).authenticate] },
    async (request, reply) => {
      const { propertyId, imageId } = request.params as {
        propertyId: string;
        imageId: string;
      };
      const { sub: userId } = request.user as { sub: string };

      try {
        const property = await db.property.findUnique({
          where: { id: propertyId },
          include: { owner: true },
        });

        if (!property) {
          return reply.status(404).send({
            success: false,
            error: { code: "NOT_FOUND", message: "Property not found" },
          });
        }

        const ownerProfile = await db.ownerProfile.findUnique({
          where: { userId },
        });

        if (property.ownerId !== ownerProfile?.id) {
          return reply.status(403).send({
            success: false,
            error: { code: "FORBIDDEN", message: "Not authorized" },
          });
        }

        const image = await db.propertyImage.findUnique({
          where: { id: imageId },
        });

        if (!image || image.propertyId !== propertyId) {
          return reply.status(404).send({
            success: false,
            error: { code: "NOT_FOUND", message: "Image not found" },
          });
        }

        // Delete from storage
        await deleteFile(image.url);

        // Delete from database
        await db.propertyImage.delete({
          where: { id: imageId },
        });

        // If this was the primary, make the next image primary
        if (image.isPrimary) {
          const nextImage = await db.propertyImage.findFirst({
            where: { propertyId },
            orderBy: { order: "asc" },
          });

          if (nextImage) {
            await db.propertyImage.update({
              where: { id: nextImage.id },
              data: { isPrimary: true },
            });
          }
        }

        return { success: true, data: { deleted: true } };
      } catch (error) {
        server.log.error(error);
        return reply.status(500).send({
          success: false,
          error: { code: "SERVER_ERROR", message: "Failed to delete image" },
        });
      }
    }
  );

  // Set primary image (protected)
  server.patch(
    "/properties/:propertyId/images/:imageId/primary",
    { preHandler: [(server as any).authenticate] },
    async (request, reply) => {
      const { propertyId, imageId } = request.params as {
        propertyId: string;
        imageId: string;
      };
      const { sub: userId } = request.user as { sub: string };

      try {
        const property = await db.property.findUnique({
          where: { id: propertyId },
          include: { owner: true },
        });

        if (!property) {
          return reply.status(404).send({
            success: false,
            error: { code: "NOT_FOUND", message: "Property not found" },
          });
        }

        const ownerProfile = await db.ownerProfile.findUnique({
          where: { userId },
        });

        if (property.ownerId !== ownerProfile?.id) {
          return reply.status(403).send({
            success: false,
            error: { code: "FORBIDDEN", message: "Not authorized" },
          });
        }

        const image = await db.propertyImage.findUnique({
          where: { id: imageId },
        });

        if (!image || image.propertyId !== propertyId) {
          return reply.status(404).send({
            success: false,
            error: { code: "NOT_FOUND", message: "Image not found" },
          });
        }

        // Clear existing primary
        await db.propertyImage.updateMany({
          where: { propertyId },
          data: { isPrimary: false },
        });

        // Set new primary
        await db.propertyImage.update({
          where: { id: imageId },
          data: { isPrimary: true },
        });

        return { success: true, data: { isPrimary: true } };
      } catch (error) {
        server.log.error(error);
        return reply.status(500).send({
          success: false,
          error: { code: "SERVER_ERROR", message: "Failed to update image" },
        });
      }
    }
  );

  // Reorder images (protected)
  server.patch(
    "/properties/:propertyId/images/reorder",
    { preHandler: [(server as any).authenticate] },
    async (request, reply) => {
      const { propertyId } = request.params as { propertyId: string };
      const { imageIds } = request.body as { imageIds: string[] };
      const { sub: userId } = request.user as { sub: string };

      if (!imageIds || !Array.isArray(imageIds)) {
        return reply.status(400).send({
          success: false,
          error: { code: "VALIDATION_ERROR", message: "imageIds array required" },
        });
      }

      try {
        const property = await db.property.findUnique({
          where: { id: propertyId },
          include: { owner: true },
        });

        if (!property) {
          return reply.status(404).send({
            success: false,
            error: { code: "NOT_FOUND", message: "Property not found" },
          });
        }

        const ownerProfile = await db.ownerProfile.findUnique({
          where: { userId },
        });

        if (property.ownerId !== ownerProfile?.id) {
          return reply.status(403).send({
            success: false,
            error: { code: "FORBIDDEN", message: "Not authorized" },
          });
        }

        // Update order for each image
        await Promise.all(
          imageIds.map((id, index) =>
            db.propertyImage.updateMany({
              where: { id, propertyId },
              data: { order: index },
            })
          )
        );

        return { success: true, data: { reordered: true } };
      } catch (error) {
        server.log.error(error);
        return reply.status(500).send({
          success: false,
          error: { code: "SERVER_ERROR", message: "Failed to reorder images" },
        });
      }
    }
  );
}
