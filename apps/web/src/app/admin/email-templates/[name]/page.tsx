"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  htmlContent: string;
  textContent: string | null;
  isActive: boolean;
  updatedAt: string;
  createdAt: string;
}

export default function EditEmailTemplatePage() {
  const { data: session } = useSession();
  const params = useParams();
  const _router = useRouter();
  const templateName = params.name as string;

  const [template, setTemplate] = useState<EmailTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    subject: "",
    htmlContent: "",
    textContent: "",
    isActive: true,
  });
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);

  useEffect(() => {
    const fetchTemplate = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/admin/email-templates/${templateName}`,
          {
            headers: {
              Authorization: `Bearer ${(session as any)?.apiToken}`,
            },
          }
        );
        const data = await response.json();
        if (data.success) {
          setTemplate(data.data);
          setFormData({
            subject: data.data.subject,
            htmlContent: data.data.htmlContent,
            textContent: data.data.textContent || "",
            isActive: data.data.isActive,
          });
        } else {
          setError("Template not found");
        }
      } catch {
        setError("Failed to load template");
      } finally {
        setLoading(false);
      }
    };

    if (session) {
      fetchTemplate();
    }
  }, [session, templateName]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/email-templates/${templateName}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${(session as any)?.apiToken}`,
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();
      if (data.success) {
        setTemplate(data.data);
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError(data.error?.message || "Failed to save template");
      }
    } catch {
      setError("An error occurred");
    } finally {
      setSaving(false);
    }
  };

  const handlePreview = () => {
    // Replace placeholders with sample data for preview
    const sampleData: Record<string, string> = {
      buyerName: "John Smith",
      propertyAddress: "123 Example Street, Auckland",
      message: "I'm interested in discussing your property...",
      matchCount: "3",
      budget: "$850,000",
    };

    let html = formData.htmlContent;
    for (const [key, value] of Object.entries(sampleData)) {
      html = html.replace(new RegExp(`{{${key}}}`, "g"), value);
    }

    setPreviewHtml(html);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-surface-raised rounded animate-pulse"></div>
        <div className="card">
          <div className="space-y-4">
            <div className="h-10 bg-surface-raised rounded animate-pulse"></div>
            <div className="h-40 bg-surface-raised rounded animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error && !template) {
    return (
      <div className="space-y-6">
        <Link
          href="/admin/email-templates"
          className="inline-flex items-center gap-1 text-text-secondary hover:text-text-base"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Templates
        </Link>
        <div className="card p-8 text-center">
          <p className="text-error">{error}</p>
        </div>
      </div>
    );
  }

  const variableHints: Record<string, string[]> = {
    new_inquiry: ["buyerName", "propertyAddress", "message"],
    inquiry_response: ["senderName", "propertyAddress"],
    new_match_direct: ["buyerName", "propertyAddress", "budget"],
    new_match_criteria: ["matchCount", "propertyAddress"],
    welcome: ["userName"],
  };

  const availableVariables = variableHints[templateName] || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/email-templates"
            className="inline-flex items-center gap-1 text-text-secondary hover:text-text-base"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </Link>
          <h1 className="text-xl font-display font-semibold text-text-base">
            <span className="font-mono text-accent">{templateName}</span>
          </h1>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {error && (
          <div className="card border-l-4 border-error">
            <p className="text-sm text-text-base">{error}</p>
          </div>
        )}

        {success && (
          <div className="card border-l-4 border-success">
            <p className="text-sm text-text-base">Template saved successfully!</p>
          </div>
        )}

        <div className="card space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-text-base">Template Settings</h2>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) =>
                  setFormData({ ...formData, isActive: e.target.checked })
                }
                className="rounded border-border text-accent focus:ring-accent"
              />
              <span className="text-sm text-text-secondary">Active</span>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">
              Subject
            </label>
            <input
              type="text"
              value={formData.subject}
              onChange={(e) =>
                setFormData({ ...formData, subject: e.target.value })
              }
              className="input"
              required
            />
          </div>

          {availableVariables.length > 0 && (
            <div className="card-compact bg-surface-raised">
              <p className="text-sm font-medium text-text-base mb-2">
                Available Variables:
              </p>
              <div className="flex flex-wrap gap-2">
                {availableVariables.map((variable) => (
                  <code
                    key={variable}
                    className="px-2 py-1 bg-surface rounded border border-border text-accent text-xs cursor-pointer hover:bg-surface-raised font-mono"
                    onClick={() => {
                      navigator.clipboard.writeText(`{{${variable}}}`);
                    }}
                    title="Click to copy"
                  >
                    {`{{${variable}}}`}
                  </code>
                ))}
              </div>
              <p className="text-xs text-text-muted mt-2">
                Available variables: use {"{{variableName}}"} syntax — replaced at send time
              </p>
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium text-text-secondary">
                HTML Content
              </label>
              <button
                type="button"
                onClick={handlePreview}
                className="btn-secondary btn-sm"
              >
                Preview
              </button>
            </div>
            <textarea
              value={formData.htmlContent}
              onChange={(e) =>
                setFormData({ ...formData, htmlContent: e.target.value })
              }
              rows={12}
              className="input min-h-[300px] font-mono text-sm resize-y"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">
              Plain Text Fallback (optional)
            </label>
            <textarea
              value={formData.textContent}
              onChange={(e) =>
                setFormData({ ...formData, textContent: e.target.value })
              }
              rows={6}
              className="input font-mono text-sm resize-y"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Link
            href="/admin/email-templates"
            className="btn-ghost btn-md"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="btn-primary btn-md disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Template"}
          </button>
        </div>
      </form>

      {/* Preview Modal */}
      {previewHtml !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="modal-panel-lg max-h-[80vh] overflow-hidden">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h3 className="font-semibold text-text-base">Email Preview</h3>
              <button
                onClick={() => setPreviewHtml(null)}
                className="text-text-muted hover:text-text-secondary"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4 bg-surface-raised">
              <p className="text-sm text-text-secondary">
                <strong className="text-text-base">Subject:</strong> {formData.subject}
              </p>
            </div>
            <div
              className="p-6 overflow-auto max-h-96 font-sans text-sm text-text-base"
              dangerouslySetInnerHTML={{ __html: previewHtml }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
