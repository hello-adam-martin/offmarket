import Link from "next/link";

export const metadata = {
  title: "Privacy Policy - OffMarket NZ",
  description: "Privacy policy for OffMarket NZ platform",
};

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Privacy Policy</h1>

      <div className="prose prose-gray max-w-none">
        <p className="text-gray-600 mb-6">
          Last updated: December 2024
        </p>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">1. Introduction</h2>
          <p className="text-gray-700 mb-4">
            OffMarket NZ (&quot;we&quot;, &quot;our&quot;, &quot;us&quot;) is committed to protecting your privacy.
            This Privacy Policy explains how we collect, use, disclose, and safeguard your
            information when you use our platform.
          </p>
          <p className="text-gray-700 mb-4">
            This policy complies with the New Zealand Privacy Act 2020 and the Information
            Privacy Principles.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">2. Information We Collect</h2>

          <h3 className="text-lg font-medium text-gray-800 mb-3">Personal Information</h3>
          <p className="text-gray-700 mb-4">
            We may collect the following personal information:
          </p>
          <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
            <li>Name and email address (required for account creation)</li>
            <li>Phone number (optional, for communication purposes)</li>
            <li>Property addresses you own or are interested in</li>
            <li>Property preferences and search criteria</li>
            <li>Communications with other users through our platform</li>
          </ul>

          <h3 className="text-lg font-medium text-gray-800 mb-3">Automatically Collected Information</h3>
          <p className="text-gray-700 mb-4">
            When you use our Service, we may automatically collect:
          </p>
          <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
            <li>IP address and browser type</li>
            <li>Device information</li>
            <li>Usage data and analytics</li>
            <li>Cookies and similar technologies</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">3. How We Use Your Information</h2>
          <p className="text-gray-700 mb-4">
            We use your information to:
          </p>
          <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
            <li>Provide and maintain the Service</li>
            <li>Match property buyers with property owners</li>
            <li>Facilitate communication between users</li>
            <li>Send notifications about matches and messages</li>
            <li>Improve and personalize your experience</li>
            <li>Respond to your inquiries and support requests</li>
            <li>Detect and prevent fraud or abuse</li>
            <li>Comply with legal obligations</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">4. Information Sharing</h2>
          <p className="text-gray-700 mb-4">
            We may share your information:
          </p>
          <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
            <li>
              <strong>With other users:</strong> When you inquire about a property or respond
              to a buyer interest, relevant contact information may be shared with the other party
            </li>
            <li>
              <strong>With service providers:</strong> Third parties that help us operate
              the Service (hosting, analytics, email delivery)
            </li>
            <li>
              <strong>For legal purposes:</strong> When required by law or to protect our rights
            </li>
            <li>
              <strong>Business transfers:</strong> In connection with a merger, acquisition,
              or sale of assets
            </li>
          </ul>
          <p className="text-gray-700 mb-4">
            We do not sell your personal information to third parties.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">5. Data Security</h2>
          <p className="text-gray-700 mb-4">
            We implement appropriate technical and organizational measures to protect your
            personal information, including:
          </p>
          <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
            <li>Encryption of data in transit and at rest</li>
            <li>Regular security assessments</li>
            <li>Access controls and authentication</li>
            <li>Secure hosting infrastructure</li>
          </ul>
          <p className="text-gray-700 mb-4">
            However, no method of transmission over the Internet is 100% secure. We cannot
            guarantee absolute security.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">6. Data Retention</h2>
          <p className="text-gray-700 mb-4">
            We retain your personal information for as long as your account is active or as
            needed to provide services. We may retain certain information as required by law
            or for legitimate business purposes.
          </p>
          <p className="text-gray-700 mb-4">
            You may request deletion of your account and associated data at any time.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">7. Your Rights</h2>
          <p className="text-gray-700 mb-4">
            Under the Privacy Act 2020, you have the right to:
          </p>
          <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
            <li>Access your personal information</li>
            <li>Request correction of inaccurate information</li>
            <li>Request deletion of your information</li>
            <li>Object to certain processing activities</li>
            <li>Withdraw consent where processing is based on consent</li>
          </ul>
          <p className="text-gray-700 mb-4">
            To exercise these rights, please contact us at{" "}
            <a href="mailto:privacy@offmarket.co.nz" className="text-primary-600 hover:text-primary-800">
              privacy@offmarket.co.nz
            </a>
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">8. Cookies</h2>
          <p className="text-gray-700 mb-4">
            We use cookies and similar technologies to:
          </p>
          <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
            <li>Keep you signed in</li>
            <li>Remember your preferences</li>
            <li>Understand how you use our Service</li>
            <li>Improve performance</li>
          </ul>
          <p className="text-gray-700 mb-4">
            You can control cookies through your browser settings, but some features may
            not function properly without them.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">9. Third-Party Links</h2>
          <p className="text-gray-700 mb-4">
            Our Service may contain links to third-party websites. We are not responsible
            for the privacy practices of these sites. We encourage you to review their
            privacy policies.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">10. Children&apos;s Privacy</h2>
          <p className="text-gray-700 mb-4">
            Our Service is not intended for individuals under 18 years of age. We do not
            knowingly collect personal information from children.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">11. Changes to This Policy</h2>
          <p className="text-gray-700 mb-4">
            We may update this Privacy Policy periodically. We will notify you of significant
            changes via email or through the Service. The updated policy will be effective
            when posted.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">12. Contact Us</h2>
          <p className="text-gray-700 mb-4">
            If you have questions or concerns about this Privacy Policy, please contact:
          </p>
          <p className="text-gray-700 mb-4">
            <strong>OffMarket NZ</strong><br />
            Email:{" "}
            <a href="mailto:privacy@offmarket.co.nz" className="text-primary-600 hover:text-primary-800">
              privacy@offmarket.co.nz
            </a>
          </p>
          <p className="text-gray-700 mb-4">
            You may also lodge a complaint with the Office of the Privacy Commissioner
            at{" "}
            <a
              href="https://www.privacy.org.nz"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-600 hover:text-primary-800"
            >
              privacy.org.nz
            </a>
          </p>
        </section>
      </div>

      <div className="mt-8 pt-8 border-t border-gray-200 flex gap-4">
        <Link href="/" className="text-primary-600 hover:text-primary-800">
          &larr; Back to Home
        </Link>
        <Link href="/terms" className="text-primary-600 hover:text-primary-800">
          Terms of Service
        </Link>
      </div>
    </div>
  );
}
