"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { formatRelativeTime } from "@offmarket/utils";

interface Stats {
  counts: {
    users: number;
    buyers: number;
    owners: number;
    properties: number;
    wantedAds: number;
    matches: number;
    inquiries: number;
  };
  recentUsers: {
    id: string;
    email: string;
    name: string | null;
    createdAt: string;
    role: string;
  }[];
}

export default function AdminDashboardPage() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/admin/stats`,
          {
            headers: {
              Authorization: `Bearer ${(session as any)?.apiToken}`,
            },
          }
        );
        const data = await response.json();
        if (data.success) {
          setStats(data.data);
        }
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      } finally {
        setLoading(false);
      }
    };

    if (session) {
      fetchStats();
    }
  }, [session]);

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-xl font-display font-semibold text-text-base">Dashboard</h1>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="card animate-pulse">
              <div className="h-4 bg-surface-raised rounded w-16 mb-2"></div>
              <div className="h-8 bg-surface-raised rounded w-12"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const statCards = stats
    ? [
        { label: "Total Users", value: stats.counts.users, emphasized: true },
        { label: "Buyers", value: stats.counts.buyers, emphasized: false },
        { label: "Owners", value: stats.counts.owners, emphasized: false },
        { label: "Properties", value: stats.counts.properties, emphasized: false },
        { label: "Buyer Interests", value: stats.counts.wantedAds, emphasized: false },
        { label: "Matches", value: stats.counts.matches, emphasized: false },
        { label: "Inquiries", value: stats.counts.inquiries, emphasized: false },
      ]
    : [];

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-display font-semibold text-text-base">Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <div
            key={stat.label}
            className={`card${stat.emphasized ? " border-l-4 border-accent" : ""}`}
          >
            <p className="text-sm text-text-secondary mb-1">{stat.label}</p>
            <p className="text-xl font-display font-semibold text-text-base tabular-nums">
              {stat.value.toLocaleString()}
            </p>
          </div>
        ))}
      </div>

      {/* Recent Users */}
      <div className="card overflow-hidden p-0">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="text-lg font-semibold text-text-base font-display">Recent Users</h2>
        </div>
        <div className="divide-y divide-border">
          {stats?.recentUsers.map((user) => (
            <div
              key={user.id}
              className="px-6 py-4 flex items-center justify-between hover:bg-surface-raised transition-colors"
            >
              <div>
                <p className="font-medium text-text-base">
                  {user.name || "No name"}
                </p>
                <p className="text-sm text-text-secondary">{user.email}</p>
              </div>
              <div className="text-right">
                <span
                  className={
                    user.role === "ADMIN"
                      ? "badge-warning"
                      : "badge-neutral"
                  }
                >
                  {user.role}
                </span>
                <p className="text-xs text-text-muted mt-1">
                  {formatRelativeTime(user.createdAt)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
