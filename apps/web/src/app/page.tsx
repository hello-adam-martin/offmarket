import Link from "next/link";
import { DemandChecker } from "@/components/demand-checker";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export default async function HomePage() {
  let heroStats: { totalBuyers: number; totalGroups: number; avgBudget: number } | null = null;
  try {
    const res = await fetch(`${API_URL}/api/wanted-ads/area-demand?limit=1`, {
      next: { revalidate: 300 },
    });
    const json = await res.json();
    if (json.success && json.summary) {
      heroStats = json.summary;
    }
  } catch {
    // D-04 fallback: static copy, no data
  }

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-bg py-16 md:py-24">
        <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-8">
          {heroStats ? (
            <>
              <h1 className="text-3xl font-display font-bold text-text-base mb-6">
                NZ property buyers are looking right now.
              </h1>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
                <div>
                  <p className="text-3xl font-display font-bold text-accent tabular-nums">{heroStats.totalBuyers}</p>
                  <p className="text-sm text-text-secondary mt-1">Active buyers</p>
                </div>
                <div>
                  <p className="text-3xl font-display font-bold text-accent tabular-nums">{heroStats.totalGroups}</p>
                  <p className="text-sm text-text-secondary mt-1">Areas with demand</p>
                </div>
                <div>
                  <p className="text-3xl font-display font-bold text-accent tabular-nums">
                    {heroStats.avgBudget ? `$${(heroStats.avgBudget / 1000).toFixed(0)}k` : "—"}
                  </p>
                  <p className="text-sm text-text-secondary mt-1">Avg budget</p>
                </div>
              </div>
            </>
          ) : (
            <>
              <h1 className="text-3xl font-display font-bold text-text-base mb-4">
                The reverse way to buy property in New Zealand.
              </h1>
              <p className="text-lg text-text-secondary mb-8 max-w-2xl">
                Buyers post what they&apos;re looking for. Owners see real demand for their unlisted homes. No agents. No listings. Just direct connections.
              </p>
            </>
          )}
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/buyer/create" className="btn-primary px-6 py-3 text-lg">
              Post Your Wanted Ad
            </Link>
            <Link href="/owner" className="btn-secondary px-6 py-3 text-lg">
              See Who Wants Your Home
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-surface py-12 border-b border-border">
        <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <div className="text-3xl md:text-4xl font-display font-bold text-accent tabular-nums">500+</div>
              <div className="text-text-secondary text-sm mt-1">Active Buyers</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-display font-bold text-accent tabular-nums">16</div>
              <div className="text-text-secondary text-sm mt-1">NZ Regions</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-display font-bold text-accent tabular-nums">$1.2M</div>
              <div className="text-text-secondary text-sm mt-1">Avg. Budget</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-display font-bold text-accent tabular-nums">48hrs</div>
              <div className="text-text-secondary text-sm mt-1">Avg. Response</div>
            </div>
          </div>
        </div>
      </section>

      {/* Demand Checker Section */}
      <section className="py-16 bg-bg">
        <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-display font-bold text-text-base mb-4">
            Check Buyer Demand for Your Property
          </h2>
          <p className="text-lg text-text-secondary mb-8 max-w-2xl">
            Curious if there are buyers waiting for a property like yours?
            Enter your address to see real-time demand in your area.
          </p>
          <DemandChecker />
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-surface">
        <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-display font-bold text-text-base mb-8">
            How It Works
          </h2>

          <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
            {/* For Buyers */}
            <div className="card">
              <h3 className="text-xl font-display font-bold text-text-base mb-6">
                For Buyers
              </h3>
              <ol className="space-y-6">
                <li className="flex gap-4">
                  <span className="flex-shrink-0 text-xl font-display font-bold text-accent w-6">1</span>
                  <div>
                    <p className="font-semibold text-text-base">
                      Register Your Interest
                    </p>
                    <p className="text-text-secondary text-sm mt-1">
                      Describe your ideal property - location, budget, bedrooms, features
                    </p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <span className="flex-shrink-0 text-xl font-display font-bold text-accent w-6">2</span>
                  <div>
                    <p className="font-semibold text-text-base">
                      Get Matched with Properties
                    </p>
                    <p className="text-text-secondary text-sm mt-1">
                      Property owners see your interest (your identity stays private)
                    </p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <span className="flex-shrink-0 text-xl font-display font-bold text-accent w-6">3</span>
                  <div>
                    <p className="font-semibold text-text-base">
                      Connect Directly
                    </p>
                    <p className="text-text-secondary text-sm mt-1">
                      Receive inquiries from motivated sellers before they list publicly
                    </p>
                  </div>
                </li>
              </ol>
              <Link
                href="/buyer/create"
                className="mt-8 inline-flex items-center gap-2 text-accent font-semibold hover:text-accent-hover"
              >
                Register your interest
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            {/* For Owners */}
            <div className="card">
              <h3 className="text-xl font-display font-bold text-text-base mb-6">
                For Property Owners
              </h3>
              <ol className="space-y-6">
                <li className="flex gap-4">
                  <span className="flex-shrink-0 text-xl font-display font-bold text-accent w-6">1</span>
                  <div>
                    <p className="font-semibold text-text-base">
                      Register Your Property
                    </p>
                    <p className="text-text-secondary text-sm mt-1">
                      Add your property details privately - nothing is publicly listed
                    </p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <span className="flex-shrink-0 text-xl font-display font-bold text-accent w-6">2</span>
                  <div>
                    <p className="font-semibold text-text-base">
                      See Real-Time Demand
                    </p>
                    <p className="text-text-secondary text-sm mt-1">
                      View how many qualified buyers are actively searching in your area
                    </p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <span className="flex-shrink-0 text-xl font-display font-bold text-accent w-6">3</span>
                  <div>
                    <p className="font-semibold text-text-base">
                      Reach Out on Your Terms
                    </p>
                    <p className="text-text-secondary text-sm mt-1">
                      Contact interested buyers when you&apos;re ready - no pressure, no agents
                    </p>
                  </div>
                </li>
              </ol>
              <Link
                href="/owner"
                className="mt-8 inline-flex items-center gap-2 text-accent font-semibold hover:text-accent-hover"
              >
                Register your property
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits / Why OffMarket */}
      <section className="py-16 bg-bg">
        <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-display font-bold text-text-base mb-8">
            Why Choose OffMarket NZ?
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="card">
              <h3 className="text-lg font-semibold text-text-base mb-2 font-display">
                Privacy First
              </h3>
              <p className="text-text-secondary">
                Your property isn&apos;t publicly listed. See demand without exposing
                your address or personal details to the world.
              </p>
            </div>

            <div className="card">
              <h3 className="text-lg font-semibold text-text-base mb-2 font-display">
                Beat the Market
              </h3>
              <p className="text-text-secondary">
                Access properties before they hit traditional listings. Get ahead
                of the competition with early access to motivated sellers.
              </p>
            </div>

            <div className="card">
              <h3 className="text-lg font-semibold text-text-base mb-2 font-display">
                Direct Connection
              </h3>
              <p className="text-text-secondary">
                Connect directly with motivated parties. No agents, no open homes,
                no time-wasters - just genuine interest.
              </p>
            </div>

            <div className="card">
              <h3 className="text-lg font-semibold text-text-base mb-2 font-display">
                Save on Fees
              </h3>
              <p className="text-text-secondary">
                Skip the traditional listing fees. Only pay a small finder&apos;s fee
                when you actually connect with a buyer.
              </p>
            </div>

            <div className="card">
              <h3 className="text-lg font-semibold text-text-base mb-2 font-display">
                Escrow Protection
              </h3>
              <p className="text-text-secondary">
                Fees are held in escrow until connection is made. If the buyer
                doesn&apos;t respond, you get a full refund.
              </p>
            </div>

            <div className="card">
              <h3 className="text-lg font-semibold text-text-base mb-2 font-display">
                NZ Focused
              </h3>
              <p className="text-text-secondary">
                Built specifically for New Zealand&apos;s property market. All 16
                regions covered, from Northland to Southland.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-16 bg-surface" id="pricing">
        <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-display font-bold text-text-base mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-lg text-text-secondary mb-8">
            Free for buyers. Affordable for owners.
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Free Tier */}
            <div className="card border-2 border-border">
              <h3 className="text-xl font-display font-bold text-text-base mb-2">Buyer - Free</h3>
              <div className="mb-6">
                <span className="text-4xl font-display font-bold tabular-nums">$0</span>
                <span className="text-text-muted">/month</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-accent mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-text-secondary">Up to 3 buyer interests</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-accent mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-text-secondary">Area-based alerts</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-accent mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-text-secondary">Direct messaging</span>
                </li>
              </ul>
              <Link href="/buyer/create" className="flex w-full items-center justify-center py-3 px-4 rounded-lg border-2 border-border text-text-secondary font-semibold hover:bg-surface-raised transition-colors">
                Get Started Free
              </Link>
            </div>

            {/* Pro Tier */}
            <div className="bg-accent text-white rounded-lg p-6 relative">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <span className="bg-accent-light text-accent rounded-sm text-xs font-bold uppercase px-2 py-1">
                  Most Popular
                </span>
              </div>
              <h3 className="text-xl font-display font-bold mb-2">Buyer - Pro</h3>
              <div className="mb-6">
                <span className="text-4xl font-display font-bold tabular-nums">$19</span>
                <span className="text-white/70">/month</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-white mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span><strong>Unlimited</strong> buyer interests</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-white mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span><strong>Specific address</strong> alerts</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-white mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span><strong>Priority</strong> notifications</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-white mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span>Early access to properties</span>
                </li>
              </ul>
              <Link href="/upgrade" className="flex w-full items-center justify-center py-3 px-4 rounded-lg bg-surface text-accent font-semibold hover:bg-surface-raised transition-colors">
                Upgrade to Pro
              </Link>
            </div>

            {/* Owner */}
            <div className="card border-2 border-border">
              <h3 className="text-xl font-display font-bold text-text-base mb-2">Property Owner</h3>
              <div className="mb-6">
                <span className="text-4xl font-display font-bold tabular-nums">$299</span>
                <span className="text-text-muted"> finder&apos;s fee</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-accent mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-text-secondary">Free to list property</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-accent mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-text-secondary">View buyer demand free</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-accent mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-text-secondary">Pay only when connecting</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-accent mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-text-secondary">Full refund if no response</span>
                </li>
              </ul>
              <Link href="/owner" className="flex w-full items-center justify-center py-3 px-4 rounded-lg border-2 border-border text-text-secondary font-semibold hover:bg-surface-raised transition-colors">
                List Your Property
              </Link>
            </div>
          </div>

          <p className="text-text-muted text-sm mt-8">
            All prices in NZD. Finder&apos;s fee varies based on property value ($299-$799).
          </p>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-bg">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-display font-bold text-text-base mb-8">
            Frequently Asked Questions
          </h2>

          <div className="space-y-6">
            <div className="border-b border-border pb-6">
              <h3 className="text-lg font-semibold text-text-base mb-2 font-display">
                How is this different from Trade Me Property or realestate.co.nz?
              </h3>
              <p className="text-text-secondary">
                Traditional platforms list properties for sale. OffMarket NZ is a
                &quot;reverse marketplace&quot; where buyers post what they&apos;re looking for,
                and property owners can see this demand. It&apos;s designed for owners
                who might consider selling but don&apos;t want to publicly list.
              </p>
            </div>

            <div className="border-b border-border pb-6">
              <h3 className="text-lg font-semibold text-text-base mb-2 font-display">
                Is my property address visible to buyers?
              </h3>
              <p className="text-text-secondary">
                No. Your exact address is never shown to buyers. They only see
                aggregated demand data for areas. You choose when and if to reveal
                your address by initiating contact with a specific buyer.
              </p>
            </div>

            <div className="border-b border-border pb-6">
              <h3 className="text-lg font-semibold text-text-base mb-2 font-display">
                What happens if a buyer doesn&apos;t respond to my inquiry?
              </h3>
              <p className="text-text-secondary">
                Your finder&apos;s fee is held in escrow. If the buyer doesn&apos;t respond
                within 30 days or declines your inquiry, you receive a full refund
                automatically. You only pay when a genuine connection is made.
              </p>
            </div>

            <div className="border-b border-border pb-6">
              <h3 className="text-lg font-semibold text-text-base mb-2 font-display">
                Do I need to be ready to sell right now?
              </h3>
              <p className="text-text-secondary">
                Not at all! Many owners register simply to understand demand.
                You&apos;re under no obligation to contact buyers. See the interest in
                your area and make decisions on your own timeline.
              </p>
            </div>

            <div className="pb-6">
              <h3 className="text-lg font-semibold text-text-base mb-2 font-display">
                Can I use this as a buyer and an owner?
              </h3>
              <p className="text-text-secondary">
                Yes! Many users are both. You might be selling your current home
                while looking for your next one. Create both profiles from your
                dashboard.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 bg-primary">
        <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-display font-bold text-text-inverse mb-4">
            Start your search today.
          </h2>
          <p className="text-text-inverse/70 text-lg mb-8 max-w-2xl">
            Join Kiwis discovering a smarter way to buy and sell property.
            Get started in under 2 minutes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/buyer/create"
              className="inline-flex items-center justify-center gap-2 bg-surface text-accent hover:bg-surface-raised px-8 py-4 rounded-lg font-semibold text-lg transition-colors"
            >
              Register Buyer Interest
            </Link>
            <Link
              href="/owner"
              className="inline-flex items-center justify-center gap-2 border-2 border-white/30 text-text-inverse hover:bg-white/10 px-8 py-4 rounded-lg font-semibold text-lg transition-colors"
            >
              List Your Property
            </Link>
          </div>
          <p className="mt-8 text-text-inverse/50 text-sm">
            No credit card required. Free for buyers.
          </p>
        </div>
      </section>
    </div>
  );
}
