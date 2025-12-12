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
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="space-y-4">
            <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-40 bg-gray-200 rounded animate-pulse"></div>
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
          className="inline-flex items-center gap-1 text-gray-600 hover:text-gray-900"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Templates
        </Link>
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-red-600">{error}</p>
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
            className="inline-flex items-center gap-1 text-gray-600 hover:text-gray-900"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">
            <span className="font-mono text-primary-600">{templateName}</span>
          </h1>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
            Template saved successfully!
          </div>
        )}

        <div className="bg-white rounded-lg shadow p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Template Settings</h2>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) =>
                  setFormData({ ...formData, isActive: e.target.checked })
                }
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-sm text-gray-700">Active</span>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Subject
            </label>
            <input
              type="text"
              value={formData.subject}
              onChange={(e) =>
                setFormData({ ...formData, subject: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              required
            />
          </div>

          {availableVariables.length > 0 && (
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-sm font-medium text-blue-800 mb-2">
                Available Variables:
              </p>
              <div className="flex flex-wrap gap-2">
                {availableVariables.map((variable) => (
                  <code
                    key={variable}
                    className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs cursor-pointer hover:bg-blue-200"
                    onClick={() => {
                      navigator.clipboard.writeText(`{{${variable}}}`);
                    }}
                    title="Click to copy"
                  >
                    {`{{${variable}}}`}
                  </code>
                ))}
              </div>
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium text-gray-700">
                HTML Content
              </label>
              <button
                type="button"
                onClick={handlePreview}
                className="text-sm text-primary-600 hover:text-primary-800"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Plain Text Fallback (optional)
            </label>
            <textarea
              value={formData.textContent}
              onChange={(e) =>
                setFormData({ ...formData, textContent: e.target.value })
              }
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono text-sm"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Link
            href="/admin/email-templates"
            className="px-4 py-2 text-gray-700 hover:text-gray-900"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Template"}
          </button>
        </div>
      </form>

      {/* Preview Modal */}
      {previewHtml !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[80vh] overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Email Preview</h3>
              <button
                onClick={() => setPreviewHtml(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4 bg-gray-50">
              <p className="text-sm text-gray-600">
                <strong>Subject:</strong> {formData.subject}
              </p>
            </div>
            <div
              className="p-6 overflow-auto max-h-96"
              dangerouslySetInnerHTML={{ __html: previewHtml }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
