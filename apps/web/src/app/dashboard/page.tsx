import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import Link from "next/link";
import { DashboardClient } from "./DashboardClient";

export default async function DashboardPage() {
  const session = await auth();

  if (!session) {
    redirect("/auth/signin?callbackUrl=/dashboard");
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">
          Welcome back, {session.user?.name || session.user?.email}
        </p>
      </div>

      {/* Pro Upgrade Banner - Client Component */}
      <DashboardClient />

      <div className="grid md:grid-cols-2 gap-6">
        {/* Buyer Section */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            As a Buyer
          </h2>
          <p className="text-gray-600 mb-4">
            Register your interest to let property owners know you&apos;re looking in
            their area.
          </p>
          <div className="space-y-3">
            <Link
              href="/buyer/my-ads"
              className="block p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">My Interests</p>
                  <p className="text-sm text-gray-500">
                    View and manage your buyer interests
                  </p>
                </div>
                <svg
                  className="w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </Link>
            <Link
              href="/buyer/create"
              className="block p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Register Interest</p>
                  <p className="text-sm text-gray-500">
                    Tell owners what you&apos;re looking for
                  </p>
                </div>
                <svg
                  className="w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
              </div>
            </Link>
          </div>
        </div>

        {/* Owner Section */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            As an Owner
          </h2>
          <p className="text-gray-600 mb-4">
            Register your property to see how many buyers are interested in your
            area.
          </p>
          <div className="space-y-3">
            <Link
              href="/owner/my-properties"
              className="block p-4 border border-gray-200 rounded-lg hover:border-accent-300 hover:bg-accent-50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">My Properties</p>
                  <p className="text-sm text-gray-500">
                    View demand for your properties
                  </p>
                </div>
                <svg
                  className="w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </Link>
            <Link
              href="/owner/register"
              className="block p-4 border border-gray-200 rounded-lg hover:border-accent-300 hover:bg-accent-50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Register Property</p>
                  <p className="text-sm text-gray-500">
                    Add a new property to check demand
                  </p>
                </div>
                <svg
                  className="w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
              </div>
            </Link>
          </div>
        </div>

        {/* Inquiries Section */}
        <div className="card md:col-span-2">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Messages & Inquiries
              </h2>
              <p className="text-gray-600">
                View and respond to messages from buyers or property owners.
              </p>
            </div>
            <Link
              href="/inquiries"
              className="btn-secondary inline-flex items-center gap-2 shrink-0"
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
                  d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                />
              </svg>
              View Messages
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
