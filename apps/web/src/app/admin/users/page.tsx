"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { formatRelativeTime } from "@offmarket/utils";

interface User {
  id: string;
  email: string;
  name: string | null;
  role: string;
  createdAt: string;
  isBuyer: boolean;
  isOwner: boolean;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export default function AdminUsersPage() {
  const { data: session } = useSession();
  const [users, setUsers] = useState<User[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);

  const fetchUsers = async (page = 1, searchQuery = "") => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
        ...(searchQuery && { search: searchQuery }),
      });

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/users?${params}`,
        {
          headers: {
            Authorization: `Bearer ${(session as any)?.apiToken}`,
          },
        }
      );
      const data = await response.json();
      if (data.success) {
        setUsers(data.data.users);
        setPagination(data.data.pagination);
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session) {
      fetchUsers();
    }
  }, [session]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchUsers(1, search);
  };

  const toggleRole = async (userId: string, currentRole: string) => {
    const newRole = currentRole === "ADMIN" ? "USER" : "ADMIN";

    if (
      newRole === "ADMIN" &&
      !confirm("Are you sure you want to make this user an admin?")
    ) {
      return;
    }

    setUpdatingUserId(userId);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/users/${userId}/role`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${(session as any)?.apiToken}`,
          },
          body: JSON.stringify({ role: newRole }),
        }
      );

      const data = await response.json();
      if (data.success) {
        setUsers((prev) =>
          prev.map((u) =>
            u.id === userId ? { ...u, role: newRole } : u
          )
        );
      }
    } catch (error) {
      console.error("Failed to update role:", error);
    } finally {
      setUpdatingUserId(null);
    }
  };

  return (
    <div className="space-y-6 max-w-content">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-display font-semibold text-text-base">Users</h1>
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by email or name..."
            className="input max-w-sm"
          />
          <button
            type="submit"
            className="btn-primary"
          >
            Search
          </button>
        </form>
      </div>

      <div className="card overflow-x-auto p-0">
        <table className="w-full min-w-[640px]">
          <thead>
            <tr className="border-b border-border">
              <th className="px-6 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wide">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wide">
                Profiles
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wide">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wide">
                Joined
              </th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-text-muted uppercase tracking-wide">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i}>
                  <td colSpan={5} className="px-6 py-4">
                    <div className="h-4 bg-surface-raised rounded animate-pulse"></div>
                  </td>
                </tr>
              ))
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-text-muted">
                  No users found
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id} className="hover:bg-surface-raised transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <p className="font-medium text-text-base">
                        {user.name || "No name"}
                      </p>
                      <p className="text-sm text-text-secondary">{user.email}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex gap-2">
                      {user.isBuyer && (
                        <span className="badge-info">
                          Buyer
                        </span>
                      )}
                      {user.isOwner && (
                        <span className="badge-neutral">
                          Owner
                        </span>
                      )}
                      {!user.isBuyer && !user.isOwner && (
                        <span className="text-xs text-text-muted">None</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={
                        user.role === "ADMIN"
                          ? "badge-warning"
                          : "badge-neutral"
                      }
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary tabular-nums">
                    {formatRelativeTime(user.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <button
                      onClick={() => toggleRole(user.id, user.role)}
                      disabled={updatingUserId === user.id}
                      className={`btn-sm min-h-[44px] ${
                        user.role === "ADMIN"
                          ? "btn-destructive"
                          : "btn-secondary"
                      } disabled:opacity-50`}
                    >
                      {updatingUserId === user.id
                        ? "Updating..."
                        : user.role === "ADMIN"
                          ? "Remove Admin"
                          : "Make Admin"}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {pagination && pagination.pages > 1 && (
          <div className="px-6 py-3 bg-surface border-t border-border flex items-center justify-between">
            <p className="text-sm text-text-secondary tabular-nums">
              Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
              {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
              {pagination.total} users
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => fetchUsers(pagination.page - 1, search)}
                disabled={pagination.page === 1}
                className="btn-secondary btn-sm disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => fetchUsers(pagination.page + 1, search)}
                disabled={pagination.page === pagination.pages}
                className="btn-secondary btn-sm disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
