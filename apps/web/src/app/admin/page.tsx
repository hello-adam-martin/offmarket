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
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-16 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-12"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const statCards = stats
    ? [
        { label: "Total Users", value: stats.counts.users, color: "blue" },
        { label: "Buyers", value: stats.counts.buyers, color: "green" },
        { label: "Owners", value: stats.counts.owners, color: "purple" },
        { label: "Properties", value: stats.counts.properties, color: "orange" },
        { label: "Buyer Interests", value: stats.counts.wantedAds, color: "pink" },
        { label: "Matches", value: stats.counts.matches, color: "cyan" },
        { label: "Inquiries", value: stats.counts.inquiries, color: "yellow" },
      ]
    : [];

  const colorClasses: Record<string, string> = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    purple: "bg-purple-50 text-purple-600",
    orange: "bg-orange-50 text-orange-600",
    pink: "bg-pink-50 text-pink-600",
    cyan: "bg-cyan-50 text-cyan-600",
    yellow: "bg-yellow-50 text-yellow-600",
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-lg shadow p-6"
          >
            <p className="text-sm text-gray-600">{stat.label}</p>
            <p className={`text-3xl font-bold ${colorClasses[stat.color]?.split(" ")[1] || "text-gray-900"}`}>
              {stat.value.toLocaleString()}
            </p>
          </div>
        ))}
      </div>

      {/* Recent Users */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Recent Users</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {stats?.recentUsers.map((user) => (
            <div
              key={user.id}
              className="p-4 flex items-center justify-between"
            >
              <div>
                <p className="font-medium text-gray-900">
                  {user.name || "No name"}
                </p>
                <p className="text-sm text-gray-600">{user.email}</p>
              </div>
              <div className="text-right">
                <span
                  className={`inline-flex px-2 py-1 text-xs font-medium rounded ${
                    user.role === "ADMIN"
                      ? "bg-purple-100 text-purple-700"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {user.role}
                </span>
                <p className="text-xs text-gray-500 mt-1">
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
