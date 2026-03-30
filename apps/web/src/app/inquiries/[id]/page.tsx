"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { formatRelativeTime } from "@offmarket/utils";
import { STATUS_LABELS } from "@/lib/constants";

interface Message {
  id: string;
  message: string;
  isOwn: boolean;
  createdAt: string;
}

interface InquiryDetail {
  id: string;
  property: {
    id: string;
    address?: string;
    suburb?: string;
    city?: string;
  };
  buyer: {
    name?: string;
    image?: string;
  };
  initiatedBy: "BUYER" | "OWNER";
  status: "PENDING" | "ACCEPTED" | "DECLINED" | "COMPLETED";
  messages: Message[];
  createdAt: string;
}

export default function InquiryDetailPage() {
  const params = useParams();
  const { data: session, status } = useSession();
  const [inquiry, setInquiry] = useState<InquiryDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const inquiryId = params.id as string;

  useEffect(() => {
    if (session && inquiryId) {
      fetchInquiry();
    }
  }, [session, inquiryId]);

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [inquiry?.messages]);

  const fetchInquiry = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/inquiries/${inquiryId}`,
        {
          headers: {
            Authorization: `Bearer ${(session as any)?.apiToken}`,
          },
        }
      );
      const data = await response.json();
      if (data.success) {
        setInquiry(data.data);
      } else {
        setError(data.error?.message || "Failed to load inquiry");
      }
    } catch {
      setError("Failed to load the conversation");
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    setSending(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/inquiries/${inquiryId}/messages`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${(session as any)?.apiToken}`,
          },
          body: JSON.stringify({ message: newMessage.trim() }),
        }
      );
      const data = await response.json();
      if (data.success) {
        setInquiry((prev) =>
          prev
            ? {
                ...prev,
                messages: [
                  ...prev.messages,
                  {
                    id: data.data.id,
                    message: data.data.message,
                    isOwn: true,
                    createdAt: data.data.createdAt,
                  },
                ],
              }
            : null
        );
        setNewMessage("");
      }
    } catch {
      console.error("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const updateStatus = async (newStatus: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/inquiries/${inquiryId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${(session as any)?.apiToken}`,
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );
      const data = await response.json();
      if (data.success) {
        setInquiry((prev) =>
          prev ? { ...prev, status: newStatus as any } : null
        );
      }
    } catch {
      console.error("Failed to update status");
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="max-w-content mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-6 bg-surface-raised rounded w-1/4 mb-4" />
          <div className="card h-96" />
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="max-w-content mx-auto px-4 py-8">
        <div className="card text-center py-12">
          <h1 className="text-xl font-display font-semibold text-primary mb-4">
            Sign in to View Messages
          </h1>
          <p className="text-secondary mb-6">
            You need to be signed in to view this conversation.
          </p>
          <Link
            href={`/auth/signin?callbackUrl=/inquiries/${inquiryId}`}
            className="btn-primary"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  if (error || !inquiry) {
    return (
      <div className="max-w-content mx-auto px-4 py-8">
        <div className="card text-center py-12">
          <h1 className="text-xl font-display font-semibold text-primary mb-4">
            Conversation Not Found
          </h1>
          <p className="text-secondary mb-6">
            {error || "This conversation doesn't exist or you don't have access to it."}
          </p>
          <Link href="/inquiries" className="btn-primary">
            Back to Messages
          </Link>
        </div>
      </div>
    );
  }

  const propertyLocation = [inquiry.property.suburb, inquiry.property.city]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="max-w-content mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link
          href="/inquiries"
          className="text-secondary hover:text-primary"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-display font-semibold text-primary">
            {inquiry.property.address || propertyLocation || "Property Inquiry"}
          </h1>
          {inquiry.property.address && propertyLocation && (
            <p className="text-sm text-secondary">{propertyLocation}</p>
          )}
        </div>
        <span
          className={STATUS_LABELS[inquiry.status].badgeClass}
          aria-label={`Status: ${STATUS_LABELS[inquiry.status].label}`}
        >
          {STATUS_LABELS[inquiry.status].label}
        </span>
      </div>

      {/* Participant info */}
      <div className="card mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {inquiry.buyer.image ? (
              <img
                src={inquiry.buyer.image}
                alt={inquiry.buyer.name || "Buyer"}
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <div
                className="w-8 h-8 rounded-full bg-accent-light flex items-center justify-center"
                aria-label={inquiry.buyer.name || "Buyer"}
              >
                <span className="text-accent font-semibold text-sm">
                  {(inquiry.buyer.name || "B").charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <div>
              <p className="font-medium text-primary">
                {inquiry.buyer.name || "Buyer"}
              </p>
              <p className="text-xs text-muted">
                Started {formatRelativeTime(inquiry.createdAt)}
              </p>
            </div>
          </div>

          {/* Status actions */}
          {inquiry.status === "PENDING" && (
            <div className="flex gap-2">
              <button
                onClick={() => updateStatus("ACCEPTED")}
                className="bg-success-light text-success border border-success rounded-sm px-3 py-1.5 text-sm font-medium hover:opacity-90 transition-opacity"
              >
                Accept
              </button>
              <button
                onClick={() => updateStatus("DECLINED")}
                className="bg-error-light text-error border border-error rounded-sm px-3 py-1.5 text-sm font-medium hover:opacity-90 transition-opacity"
              >
                Decline
              </button>
            </div>
          )}
          {inquiry.status === "ACCEPTED" && (
            <button
              onClick={() => updateStatus("COMPLETED")}
              className="btn-secondary"
            >
              Mark Complete
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="card mb-4">
        <div
          role="log"
          aria-live="polite"
          aria-label="Message thread"
          className="space-y-4 max-h-[400px] overflow-y-auto p-1"
        >
          {inquiry.messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.isOwn ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] ${
                  msg.isOwn
                    ? "bg-accent text-white rounded-lg rounded-br-sm p-3"
                    : "bg-surface-raised text-primary rounded-lg rounded-bl-sm p-3"
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.message}</p>
                <p className="text-xs text-muted mt-1">
                  {formatRelativeTime(msg.createdAt)}
                </p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Message input */}
      {inquiry.status !== "DECLINED" && inquiry.status !== "COMPLETED" && (
        <form onSubmit={sendMessage} className="flex gap-2">
          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Write your reply..."
            className="input flex-1 resize-none"
            rows={2}
            disabled={sending}
          />
          <button
            type="submit"
            disabled={sending || !newMessage.trim()}
            className="btn-primary"
          >
            {sending ? "Sending..." : "Send"}
          </button>
        </form>
      )}

      {(inquiry.status === "DECLINED" || inquiry.status === "COMPLETED") && (
        <div className="text-center py-4 text-muted">
          This conversation has been {inquiry.status.toLowerCase()}.
        </div>
      )}
    </div>
  );
}
