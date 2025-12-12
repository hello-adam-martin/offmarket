import { db } from "@offmarket/database";
import { refundEscrow } from "../services/stripe.js";

/**
 * Process expired escrow deposits
 * Should be run periodically (e.g., daily via cron)
 * Refunds any escrow deposits that have passed their expiry date without being resolved
 */
export async function processExpiredEscrows(): Promise<{
  processed: number;
  refunded: number;
  errors: string[];
}> {
  const now = new Date();
  const errors: string[] = [];
  let refunded = 0;

  // Find all HELD escrows that have expired
  const expiredEscrows = await db.escrowDeposit.findMany({
    where: {
      status: "HELD",
      expiresAt: { lt: now },
    },
    include: {
      owner: { include: { user: { select: { email: true, name: true } } } },
      property: { select: { address: true } },
      buyer: { include: { user: { select: { name: true } } } },
    },
  });

  for (const escrow of expiredEscrows) {
    try {
      // Check if inquiry was resolved
      if (escrow.inquiryId) {
        const inquiry = await db.inquiry.findUnique({
          where: { id: escrow.inquiryId },
        });

        // If inquiry exists and is still pending, refund
        if (inquiry && inquiry.status === "PENDING") {
          await refundEscrow(escrow.id);
          refunded++;

          // Update escrow status to EXPIRED
          await db.escrowDeposit.update({
            where: { id: escrow.id },
            data: { status: "EXPIRED" },
          });

          // Create notification for owner
          if (escrow.owner.userId) {
            await db.notification.create({
              data: {
                userId: escrow.owner.userId,
                type: "ESCROW_EXPIRED",
                title: "Escrow refunded",
                message: `Your finder's fee for ${escrow.buyer.user.name || "a buyer"} has been refunded as the inquiry expired without response.`,
                data: { escrowId: escrow.id, propertyId: escrow.propertyId },
              },
            });
          }
        }
      } else {
        // No inquiry linked - refund the orphaned escrow
        await refundEscrow(escrow.id);
        refunded++;

        await db.escrowDeposit.update({
          where: { id: escrow.id },
          data: { status: "EXPIRED" },
        });
      }
    } catch (error) {
      const errMsg = `Failed to process escrow ${escrow.id}: ${error instanceof Error ? error.message : String(error)}`;
      errors.push(errMsg);
      console.error(errMsg);
    }
  }

  return {
    processed: expiredEscrows.length,
    refunded,
    errors,
  };
}

/**
 * Run as standalone script
 */
if (import.meta.url === `file://${process.argv[1]}`) {
  processExpiredEscrows()
    .then((result) => {
      console.log("Escrow expiry job completed:", result);
      process.exit(result.errors.length > 0 ? 1 : 0);
    })
    .catch((error) => {
      console.error("Escrow expiry job failed:", error);
      process.exit(1);
    });
}
