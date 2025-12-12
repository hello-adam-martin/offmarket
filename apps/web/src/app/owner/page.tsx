import Link from "next/link";
import { DemandChecker } from "@/components/demand-checker";

export default function OwnerPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero */}
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Discover Hidden Demand for Your Property
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          See how many buyers are waiting for a property like yours - without
          publicly listing it. Stay in control while exploring your options.
        </p>
      </div>

      {/* Quick Check */}
      <div className="mb-12">
        <h2 className="text-xl font-semibold text-gray-900 text-center mb-6">
          Check Demand Instantly
        </h2>
        <DemandChecker />
      </div>

      {/* Benefits */}
      <div className="grid md:grid-cols-3 gap-6 mb-12">
        <div className="card text-center">
          <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-accent-100 flex items-center justify-center">
            <svg
              className="w-6 h-6 text-accent-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">100% Private</h3>
          <p className="text-sm text-gray-600">
            Your property is never publicly listed. Only you can see the detailed
            demand data.
          </p>
        </div>

        <div className="card text-center">
          <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-accent-100 flex items-center justify-center">
            <svg
              className="w-6 h-6 text-accent-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">See Real Demand</h3>
          <p className="text-sm text-gray-600">
            View actual buyer budgets and requirements. Know what your property
            is worth to real buyers.
          </p>
        </div>

        <div className="card text-center">
          <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-accent-100 flex items-center justify-center">
            <svg
              className="w-6 h-6 text-accent-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Connect on Your Terms</h3>
          <p className="text-sm text-gray-600">
            Reach out to interested buyers only when you&apos;re ready. No
            pressure, no agents.
          </p>
        </div>
      </div>

      {/* CTA */}
      <div className="card bg-gradient-to-br from-accent-50 to-primary-50 text-center py-10">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Ready to See Who Wants Your Property?
        </h2>
        <p className="text-gray-600 mb-6 max-w-md mx-auto">
          Register your property (it stays private) and instantly see matching
          buyer interest.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/owner/register" className="btn-primary px-6 py-3">
            Register Your Property
          </Link>
          <Link href="/auth/signin" className="btn-secondary px-6 py-3">
            Sign In
          </Link>
        </div>
      </div>

      {/* FAQ */}
      <div className="mt-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          Frequently Asked Questions
        </h2>
        <div className="space-y-4">
          <div className="card">
            <h3 className="font-medium text-gray-900 mb-2">
              Is my property address publicly visible?
            </h3>
            <p className="text-gray-600 text-sm">
              No. Your exact address is never shown to buyers. They can only see
              anonymized information about demand in your area until you choose
              to make contact.
            </p>
          </div>
          <div className="card">
            <h3 className="font-medium text-gray-900 mb-2">
              Do I have to sell if there&apos;s interest?
            </h3>
            <p className="text-gray-600 text-sm">
              Absolutely not. Registering your property is just for information.
              You&apos;re under no obligation to contact buyers or sell your
              property.
            </p>
          </div>
          <div className="card">
            <h3 className="font-medium text-gray-900 mb-2">
              What information can buyers see about me?
            </h3>
            <p className="text-gray-600 text-sm">
              Initially, nothing. Buyers only see that there&apos;s a property in
              their target area that matches their criteria. Your details are
              only shared if you initiate contact.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
