import Link from "next/link";

export const metadata = {
  title: "Terms of Service - OffMarket NZ",
  description: "Terms of service for using OffMarket NZ platform",
};

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Terms of Service</h1>

      <div className="prose prose-gray max-w-none">
        <p className="text-gray-600 mb-6">
          Last updated: December 2024
        </p>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">1. Acceptance of Terms</h2>
          <p className="text-gray-700 mb-4">
            By accessing or using OffMarket NZ (&quot;the Service&quot;), you agree to be bound by these
            Terms of Service. If you do not agree to these terms, please do not use the Service.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">2. Description of Service</h2>
          <p className="text-gray-700 mb-4">
            OffMarket NZ is a platform that connects property buyers with property owners in
            New Zealand. The Service allows:
          </p>
          <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
            <li>Buyers to express interest in properties or areas they wish to purchase</li>
            <li>Property owners to register their properties and view buyer demand</li>
            <li>Facilitated communication between interested parties</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">3. User Accounts</h2>
          <p className="text-gray-700 mb-4">
            To use certain features of the Service, you must create an account. You agree to:
          </p>
          <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
            <li>Provide accurate and complete information</li>
            <li>Maintain the security of your account credentials</li>
            <li>Accept responsibility for all activities under your account</li>
            <li>Notify us immediately of any unauthorized use</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">4. User Conduct</h2>
          <p className="text-gray-700 mb-4">
            You agree not to:
          </p>
          <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
            <li>Post false, misleading, or fraudulent information</li>
            <li>Impersonate others or misrepresent your identity</li>
            <li>Use the Service for any unlawful purpose</li>
            <li>Attempt to gain unauthorized access to any part of the Service</li>
            <li>Interfere with or disrupt the Service</li>
            <li>Collect personal information about other users without consent</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">5. Property Information</h2>
          <p className="text-gray-700 mb-4">
            Property owners warrant that they have the legal right to represent the properties
            they register. Buyers understand that property information provided is for
            informational purposes and should be independently verified.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">6. No Real Estate Advice</h2>
          <p className="text-gray-700 mb-4">
            OffMarket NZ is not a licensed real estate agency. The Service does not provide
            legal, financial, or real estate advice. Users should seek appropriate professional
            advice for property transactions.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">7. Limitation of Liability</h2>
          <p className="text-gray-700 mb-4">
            To the maximum extent permitted by New Zealand law, OffMarket NZ shall not be
            liable for any indirect, incidental, special, consequential, or punitive damages,
            including but not limited to loss of profits, arising from your use of the Service.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">8. Privacy</h2>
          <p className="text-gray-700 mb-4">
            Your use of the Service is also governed by our{" "}
            <Link href="/privacy" className="text-primary-600 hover:text-primary-800">
              Privacy Policy
            </Link>
            , which describes how we collect, use, and protect your personal information.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">9. Changes to Terms</h2>
          <p className="text-gray-700 mb-4">
            We may modify these Terms at any time. We will notify users of significant changes
            via email or through the Service. Continued use after changes constitutes acceptance
            of the modified Terms.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">10. Governing Law</h2>
          <p className="text-gray-700 mb-4">
            These Terms shall be governed by and construed in accordance with the laws of
            New Zealand. Any disputes shall be subject to the exclusive jurisdiction of the
            courts of New Zealand.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">11. Contact</h2>
          <p className="text-gray-700 mb-4">
            If you have questions about these Terms, please contact us at{" "}
            <a href="mailto:support@offmarket.co.nz" className="text-primary-600 hover:text-primary-800">
              support@offmarket.co.nz
            </a>
          </p>
        </section>
      </div>

      <div className="mt-8 pt-8 border-t border-gray-200">
        <Link href="/" className="text-primary-600 hover:text-primary-800">
          &larr; Back to Home
        </Link>
      </div>
    </div>
  );
}
