"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { formatRelativeTime } from "@offmarket/utils";

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

export default function EmailTemplatesPage() {
  const { data: session } = useSession();
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTemplate, setNewTemplate] = useState({
    name: "",
    subject: "",
    htmlContent: "",
  });
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTemplates = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/email-templates`,
        {
          headers: {
            Authorization: `Bearer ${(session as any)?.apiToken}`,
          },
        }
      );
      const data = await response.json();
      if (data.success) {
        setTemplates(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch templates:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session) {
      fetchTemplates();
    }
  }, [session]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setError(null);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/email-templates`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${(session as any)?.apiToken}`,
          },
          body: JSON.stringify(newTemplate),
        }
      );

      const data = await response.json();
      if (data.success) {
        setTemplates((prev) => [...prev, data.data]);
        setShowCreateModal(false);
        setNewTemplate({ name: "", subject: "", htmlContent: "" });
      } else {
        setError(data.error?.message || "Failed to create template");
      }
    } catch {
      setError("An error occurred");
    } finally {
      setCreating(false);
    }
  };

  const templateDescriptions: Record<string, string> = {
    new_inquiry: "Sent to property owners when a buyer initiates contact",
    inquiry_response: "Sent when there's a new message in an inquiry thread",
    new_match_direct: "Sent to owners when a buyer specifically names their property",
    new_match_criteria: "Sent to owners when their property matches buyer criteria",
    welcome: "Sent to new users upon registration",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-display font-semibold text-text-base">Email Templates</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-primary btn-md"
        >
          Create Template
        </button>
      </div>

      {templates.length === 0 && !loading ? (
        <div className="card p-8 text-center">
          <div className="w-12 h-12 mx-auto mb-4 rounded-lg bg-surface-raised flex items-center justify-center">
            <svg
              className="w-6 h-6 text-text-muted"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-text-base mb-2 font-display">
            No email templates yet
          </h3>
          <p className="text-text-secondary mb-4">
            Create templates to customize the emails sent by OffMarket NZ.
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary btn-md"
          >
            Create First Template
          </button>
        </div>
      ) : (
        <div className="card overflow-x-auto p-0">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="px-6 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wide">
                  Template
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wide">
                  Subject
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wide">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wide">
                  Updated
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-text-muted uppercase tracking-wide">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                [...Array(3)].map((_, i) => (
                  <tr key={i}>
                    <td colSpan={5} className="px-6 py-4">
                      <div className="h-4 bg-surface-raised rounded animate-pulse"></div>
                    </td>
                  </tr>
                ))
              ) : (
                templates.map((template) => (
                  <tr key={template.id} className="hover:bg-surface-raised transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <p className="font-semibold text-text-base font-mono text-sm">
                          {template.name}
                        </p>
                        <p className="text-xs text-text-muted">
                          {templateDescriptions[template.name] || "Custom template"}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-text-base truncate max-w-xs">
                        {template.subject}
                      </p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={template.isActive ? "badge-success" : "badge-neutral"}>
                        {template.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary tabular-nums">
                      {formatRelativeTime(template.updatedAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <Link
                        href={`/admin/email-templates/${template.name}`}
                        className="btn-secondary btn-sm"
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="modal-panel-lg">
            <form onSubmit={handleCreate}>
              <div className="p-6">
                <h2 className="text-xl font-semibold text-text-base mb-4 font-display">
                  Create Email Template
                </h2>

                {error && (
                  <div className="mb-4 card border-l-4 border-error p-3">
                    <p className="text-sm text-text-base">{error}</p>
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">
                      Template Name
                    </label>
                    <input
                      type="text"
                      value={newTemplate.name}
                      onChange={(e) =>
                        setNewTemplate({ ...newTemplate, name: e.target.value })
                      }
                      placeholder="e.g., new_inquiry"
                      pattern="^[a-z_]+$"
                      className="input font-mono text-sm"
                      required
                    />
                    <p className="text-xs text-text-muted mt-1">
                      Lowercase letters and underscores only
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">
                      Subject
                    </label>
                    <input
                      type="text"
                      value={newTemplate.subject}
                      onChange={(e) =>
                        setNewTemplate({ ...newTemplate, subject: e.target.value })
                      }
                      placeholder="e.g., New inquiry for {{propertyAddress}}"
                      className="input"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">
                      HTML Content
                    </label>
                    <textarea
                      value={newTemplate.htmlContent}
                      onChange={(e) =>
                        setNewTemplate({ ...newTemplate, htmlContent: e.target.value })
                      }
                      placeholder="<p>Hello,</p><p>{{message}}</p>"
                      rows={6}
                      className="input min-h-[150px] font-mono text-sm resize-y"
                      required
                    />
                    <p className="text-xs text-text-muted mt-1">
                      Use {"{{variableName}}"} for dynamic content
                    </p>
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 bg-surface-raised rounded-b-lg flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="btn-ghost btn-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="btn-primary btn-md disabled:opacity-50"
                >
                  {creating ? "Creating..." : "Create Template"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
