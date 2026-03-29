"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import { ThemeToggle } from "@/components/ThemeToggle";

export function Header() {
  const { data: session, status } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (session) {
      fetchUnreadCount();
      // Poll every 30 seconds for new notifications
      const interval = setInterval(fetchUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [session]);

  const fetchUnreadCount = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/notifications/unread-count`,
        {
          headers: {
            Authorization: `Bearer ${(session as any)?.apiToken}`,
          },
        }
      );
      const data = await response.json();
      if (data.success) {
        setUnreadCount(data.data.count);
      }
    } catch {
      // Silently fail
    }
  };

  return (
    <header className="bg-surface border-b border-border">
      <nav className="max-w-[1120px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link href="/" className="flex items-center">
              <span className="text-[20px] font-bold font-display text-accent">
                OffMarket
              </span>
              <span className="text-[20px] font-bold font-display text-text-base">NZ</span>
            </Link>
            <div className="hidden sm:ml-8 sm:flex sm:space-x-4">
              <Link
                href="/explore"
                className="inline-flex items-center px-3 py-2 text-sm font-sans text-text-secondary hover:text-text-base transition-colors"
              >
                Explorer
              </Link>
              <Link
                href="/buyer/create"
                className="inline-flex items-center px-3 py-2 text-sm font-sans text-text-secondary hover:text-text-base transition-colors"
              >
                Register Interest
              </Link>
              <Link
                href="/owner"
                className="inline-flex items-center px-3 py-2 text-sm font-sans text-text-secondary hover:text-text-base transition-colors"
              >
                For Owners
              </Link>
            </div>
          </div>

          <div className="hidden sm:flex sm:items-center sm:space-x-2">
            <ThemeToggle />
            {status === "loading" ? (
              <div className="w-8 h-8 rounded-full bg-surface-raised animate-pulse" />
            ) : session ? (
              <div className="flex items-center space-x-2">
                <Link
                  href="/dashboard"
                  className="text-sm font-medium text-text-secondary hover:text-text-base transition-colors px-2 py-1"
                >
                  Dashboard
                </Link>
                <Link
                  href="/saved-searches"
                  className="p-2 text-text-secondary hover:text-text-base rounded-md hover:bg-surface-raised transition-colors"
                  title="Saved Searches"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                    />
                  </svg>
                </Link>
                <Link
                  href="/notifications"
                  className="relative p-2 text-text-secondary hover:text-text-base rounded-md hover:bg-surface-raised transition-colors"
                >
                  <svg
                    className="w-5 h-5"
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
                  {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 bg-accent text-white text-xs font-semibold rounded-full h-5 w-5 flex items-center justify-center tabular-nums">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </Link>
                <button
                  onClick={() => signOut()}
                  className="btn-ghost text-sm"
                >
                  Sign Out
                </button>
                <Link
                  href="/profile"
                  className="w-8 h-8 rounded-full bg-accent-light flex items-center justify-center hover:bg-accent/20 transition-colors"
                >
                  <span className="text-sm font-medium text-accent">
                    {session.user?.name?.charAt(0) ||
                      session.user?.email?.charAt(0) ||
                      "U"}
                  </span>
                </Link>
              </div>
            ) : (
              <>
                <Link href="/auth/signin" className="btn-ghost text-sm">
                  Sign In
                </Link>
                <Link href="/auth/signin" className="btn-primary text-sm">
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center gap-2 sm:hidden">
            <ThemeToggle />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="btn-ghost h-9 w-9 p-0 inline-flex items-center justify-center"
              aria-expanded={mobileMenuOpen}
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            >
              <span className="sr-only">{mobileMenuOpen ? "Close menu" : "Open menu"}</span>
              {mobileMenuOpen ? (
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="sm:hidden bg-surface border-b border-border">
            <div className="space-y-1 p-4">
              <Link
                href="/explore"
                className="block py-2 text-sm text-text-secondary hover:text-text-base"
              >
                Explorer
              </Link>
              <Link
                href="/buyer/create"
                className="block py-2 text-sm text-text-secondary hover:text-text-base"
              >
                Register Interest
              </Link>
              <Link
                href="/owner"
                className="block py-2 text-sm text-text-secondary hover:text-text-base"
              >
                For Owners
              </Link>
              {session ? (
                <>
                  <Link
                    href="/dashboard"
                    className="block py-2 text-sm text-text-secondary hover:text-text-base"
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/saved-searches"
                    className="block py-2 text-sm text-text-secondary hover:text-text-base"
                  >
                    Saved Searches
                  </Link>
                  <Link
                    href="/notifications"
                    className="block py-2 text-sm text-text-secondary hover:text-text-base"
                  >
                    Notifications
                    {unreadCount > 0 && (
                      <span className="ml-2 inline-flex items-center justify-center px-2 py-0.5 text-xs font-semibold text-white bg-accent rounded-full tabular-nums">
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </span>
                    )}
                  </Link>
                  <button
                    onClick={() => signOut()}
                    className="block w-full text-left py-2 text-sm text-text-secondary hover:text-text-base"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <Link
                  href="/auth/signin"
                  className="block py-2 text-sm text-accent hover:text-text-base"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
