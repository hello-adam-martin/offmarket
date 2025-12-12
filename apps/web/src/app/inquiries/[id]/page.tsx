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
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4" />
          <div className="card h-96" />
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="card text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Sign in to View Messages
          </h1>
          <p className="text-gray-600 mb-6">
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
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="card text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Conversation Not Found
          </h1>
          <p className="text-gray-600 mb-6">
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
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link
          href="/inquiries"
          className="text-gray-600 hover:text-gray-900"
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
          <h1 className="text-xl font-bold text-gray-900">
            {inquiry.property.address || propertyLocation || "Property Inquiry"}
          </h1>
          {inquiry.property.address && propertyLocation && (
            <p className="text-sm text-gray-600">{propertyLocation}</p>
          )}
        </div>
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_LABELS[inquiry.status].className}`}
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
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                <span className="text-primary-600 font-semibold">
                  {(inquiry.buyer.name || "B").charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <div>
              <p className="font-medium text-gray-900">
                {inquiry.buyer.name || "Buyer"}
              </p>
              <p className="text-xs text-gray-500">
                Started {formatRelativeTime(inquiry.createdAt)}
              </p>
            </div>
          </div>

          {/* Status actions */}
          {inquiry.status === "PENDING" && (
            <div className="flex gap-2">
              <button
                onClick={() => updateStatus("ACCEPTED")}
                className="text-sm px-3 py-1 bg-green-100 text-green-700 rounded-lg hover:bg-green-200"
              >
                Accept
              </button>
              <button
                onClick={() => updateStatus("DECLINED")}
                className="text-sm px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
              >
                Decline
              </button>
            </div>
          )}
          {inquiry.status === "ACCEPTED" && (
            <button
              onClick={() => updateStatus("COMPLETED")}
              className="text-sm px-3 py-1 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              Mark Complete
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="card mb-4">
        <div className="space-y-4 max-h-[400px] overflow-y-auto p-1">
          {inquiry.messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.isOwn ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] px-4 py-2 rounded-lg ${
                  msg.isOwn
                    ? "bg-primary-600 text-white"
                    : "bg-gray-100 text-gray-900"
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.message}</p>
                <p
                  className={`text-xs mt-1 ${
                    msg.isOwn ? "text-primary-200" : "text-gray-500"
                  }`}
                >
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
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="input flex-1"
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
        <div className="text-center py-4 text-gray-500">
          This conversation has been {inquiry.status.toLowerCase()}.
        </div>
      )}
    </div>
  );
}
