import { Resend } from "resend";
import { db } from "@offmarket/database";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const DEFAULT_FROM = process.env.EMAIL_FROM || "OffMarket NZ <noreply@offmarket.nz>";

interface SendEmailOptions {
  to: string;
  templateName: string;
  variables: Record<string, string>;
}

/**
 * Send an email using a template from the database.
 * Variables in the template are replaced using {{variableName}} syntax.
 */
export async function sendEmail({
  to,
  templateName,
  variables,
}: SendEmailOptions): Promise<{ success: boolean; error?: string }> {
  // Skip if Resend is not configured
  if (!resend) {
    console.log(`[Email] Resend not configured, skipping email to ${to} (template: ${templateName})`);
    return { success: true }; // Return success in dev mode
  }

  try {
    // Get template from database
    const template = await db.emailTemplate.findUnique({
      where: { name: templateName },
    });

    if (!template) {
      console.warn(`[Email] Template "${templateName}" not found`);
      return { success: false, error: "Template not found" };
    }

    if (!template.isActive) {
      console.log(`[Email] Template "${templateName}" is inactive, skipping`);
      return { success: true }; // Not an error, just skipped
    }

    // Replace {{variable}} placeholders
    let subject = template.subject;
    let html = template.htmlContent;
    let text = template.textContent || "";

    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`{{${key}}}`, "g");
      subject = subject.replace(regex, value);
      html = html.replace(regex, value);
      text = text.replace(regex, value);
    }

    // Send email via Resend
    const { error } = await resend.emails.send({
      from: DEFAULT_FROM,
      to,
      subject,
      html,
      ...(text && { text }),
    });

    if (error) {
      console.error(`[Email] Failed to send to ${to}:`, error);
      return { success: false, error: error.message };
    }

    console.log(`[Email] Sent "${templateName}" to ${to}`);
    return { success: true };
  } catch (err) {
    console.error(`[Email] Error sending to ${to}:`, err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

/**
 * Send email for new inquiry notification
 */
export async function sendNewInquiryEmail(params: {
  ownerEmail: string;
  buyerName: string;
  propertyAddress: string;
  message: string;
}): Promise<void> {
  await sendEmail({
    to: params.ownerEmail,
    templateName: "new_inquiry",
    variables: {
      buyerName: params.buyerName,
      propertyAddress: params.propertyAddress,
      message: params.message,
    },
  });
}

/**
 * Send email for inquiry response notification
 */
export async function sendInquiryResponseEmail(params: {
  recipientEmail: string;
  senderName: string;
  propertyAddress: string;
}): Promise<void> {
  await sendEmail({
    to: params.recipientEmail,
    templateName: "inquiry_response",
    variables: {
      senderName: params.senderName,
      propertyAddress: params.propertyAddress,
    },
  });
}

/**
 * Send email for direct match notification (buyer named specific property)
 */
export async function sendDirectMatchEmail(params: {
  ownerEmail: string;
  buyerName: string;
  propertyAddress: string;
  budget: string;
}): Promise<void> {
  await sendEmail({
    to: params.ownerEmail,
    templateName: "new_match_direct",
    variables: {
      buyerName: params.buyerName,
      propertyAddress: params.propertyAddress,
      budget: params.budget,
    },
  });
}

/**
 * Send email for criteria match notification
 */
export async function sendCriteriaMatchEmail(params: {
  ownerEmail: string;
  propertyAddress: string;
  matchCount: number;
}): Promise<void> {
  await sendEmail({
    to: params.ownerEmail,
    templateName: "new_match_criteria",
    variables: {
      propertyAddress: params.propertyAddress,
      matchCount: params.matchCount.toString(),
    },
  });
}
