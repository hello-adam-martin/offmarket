"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { formatRelativeTime } from "@offmarket/utils";

interface Notification {
  id: string;
  type: "NEW_MATCH" | "NEW_INQUIRY" | "INQUIRY_RESPONSE" | "PROPERTY_INTEREST" | "SYSTEM";
  title: string;
  message: string;
  data?: {
    inquiryId?: string;
    propertyId?: string;
    wantedAdId?: string;
    matchId?: string;
  };
  isRead: boolean;
  createdAt: string;
}

// Icon color mapping per UI-SPEC semantic color scheme
const NOTIFICATION_ICON_CLASS: Record<string, string> = {
  NEW_MATCH: "text-success",
  NEW_INQUIRY: "text-accent",
  INQUIRY_RESPONSE: "text-accent",
  PROPERTY_INTEREST: "text-accent",
  SYSTEM: "text-muted",
};

const NOTIFICATION_ICONS: Record<string, React.ReactNode> = {
  NEW_MATCH: (
    <svg className={`w-5 h-5 ${NOTIFICATION_ICON_CLASS.NEW_MATCH}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  NEW_INQUIRY: (
    <svg className={`w-5 h-5 ${NOTIFICATION_ICON_CLASS.NEW_INQUIRY}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
    </svg>
  ),
  INQUIRY_RESPONSE: (
    <svg className={`w-5 h-5 ${NOTIFICATION_ICON_CLASS.INQUIRY_RESPONSE}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
    </svg>
  ),
  PROPERTY_INTEREST: (
    <svg className={`w-5 h-5 ${NOTIFICATION_ICON_CLASS.PROPERTY_INTEREST}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  ),
  SYSTEM: (
    <svg className={`w-5 h-5 ${NOTIFICATION_ICON_CLASS.SYSTEM}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  WARNING: (
    <svg className="w-5 h-5 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  ),
};

function getNotificationLink(notification: Notification): string | null {
  if (notification.data?.inquiryId) {
    return `/inquiries/${notification.data.inquiryId}`;
  }
  if (notification.data?.propertyId) {
    return `/owner/properties/${notification.data.propertyId}`;
  }
  if (notification.data?.wantedAdId) {
    return `/wanted/${notification.data.wantedAdId}`;
  }
  return null;
}

export default function NotificationsPage() {
  const { data: session, status } = useSession();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (session) {
      fetchNotifications();
    }
  }, [session]);

  const fetchNotifications = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/notifications`,
        {
          headers: {
            Authorization: `Bearer ${(session as any)?.apiToken}`,
          },
        }
      );
      const data = await response.json();
      if (data.success) {
        setNotifications(data.data.notifications || []);
        setUnreadCount(data.data.unreadCount || 0);
      } else {
        setError(data.error?.message || "Failed to load notifications");
      }
    } catch {
      setError("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/notifications/${id}/read`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${(session as any)?.apiToken}`,
          },
        }
      );
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {
      console.error("Failed to mark notification as read");
    }
  };

  const markAllAsRead = async () => {
    try {
      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/notifications/read-all`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${(session as any)?.apiToken}`,
          },
        }
      );
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch {
      console.error("Failed to mark all as read");
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/notifications/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${(session as any)?.apiToken}`,
          },
        }
      );
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch {
      console.error("Failed to delete notification");
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="max-w-content mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-6 bg-surface-raised rounded-sm w-1/3 mb-4" />
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-surface-raised rounded-sm" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="max-w-content mx-auto px-4 py-8">
        <div className="card text-center py-12">
          <h1 className="text-xl font-display font-semibold text-primary mb-4">
            Sign in to View Notifications
          </h1>
          <p className="text-secondary mb-6">
            You need to be signed in to view your notifications.
          </p>
          <Link
            href="/auth/signin?callbackUrl=/notifications"
            className="btn-primary"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-content mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-display font-semibold text-primary">Notifications</h1>
          {unreadCount > 0 && (
            <p className="text-sm text-secondary">
              {unreadCount} unread notification{unreadCount !== 1 ? "s" : ""}
            </p>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="text-sm text-accent hover:text-accent-hover"
          >
            Mark all as read
          </button>
        )}
      </div>

      {error && (
        <div className="p-4 bg-error-light border border-error rounded-md text-error mb-6">
          {error}
        </div>
      )}

      {notifications.length === 0 ? (
        <div className="card text-center py-12">
          <svg
            className="w-5 h-5 text-muted mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            />
          </svg>
          <h2 className="text-xl font-display font-semibold text-primary mb-2">
            No notifications
          </h2>
          <p className="text-secondary">
            You&apos;re up to date. Activity on your ads and properties will appear here.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-border">
          {notifications.map((notification) => {
            const link = getNotificationLink(notification);
            const content = (
              <div
                className={`flex items-start gap-4 py-4 transition-colors ${
                  !notification.isRead
                    ? "bg-surface border-l-2 border-accent pl-4"
                    : "bg-background"
                }`}
              >
                <div className="shrink-0 mt-0.5">
                  {NOTIFICATION_ICONS[notification.type] || NOTIFICATION_ICONS.SYSTEM}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-medium text-primary">
                        {notification.title}
                      </p>
                      <p className="text-sm text-secondary mt-0.5">
                        {notification.message}
                      </p>
                    </div>
                    {!notification.isRead && (
                      <span className="flex-shrink-0 w-2 h-2 bg-accent rounded-sm mt-2" />
                    )}
                  </div>
                  <div className="flex items-center gap-4 mt-2">
                    <p className="text-xs text-muted">
                      {formatRelativeTime(notification.createdAt)}
                    </p>
                    {!notification.isRead && (
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          markAsRead(notification.id);
                        }}
                        className="text-xs text-accent hover:text-accent-hover"
                      >
                        Mark as read
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        deleteNotification(notification.id);
                      }}
                      className="text-xs text-muted hover:text-error"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            );

            return link ? (
              <Link
                key={notification.id}
                href={link}
                onClick={() => {
                  if (!notification.isRead) {
                    markAsRead(notification.id);
                  }
                }}
              >
                {content}
              </Link>
            ) : (
              <div key={notification.id}>{content}</div>
            );
          })}
        </div>
      )}
    </div>
  );
}
