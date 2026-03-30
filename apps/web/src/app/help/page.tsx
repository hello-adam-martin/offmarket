"use client";

import { useState } from "react";
import Link from "next/link";

interface FAQItem {
  question: string;
  answer: string;
  category: "general" | "buyers" | "owners";
}

const faqs: FAQItem[] = [
  // General
  {
    category: "general",
    question: "What is OffMarket NZ?",
    answer:
      "OffMarket NZ is a reverse real estate marketplace that connects property buyers with property owners in New Zealand. Instead of owners listing properties for sale, buyers register what they're looking for, and owners can see the demand for their area or property.",
  },
  {
    category: "general",
    question: "Is OffMarket NZ free to use?",
    answer:
      "Yes, OffMarket NZ is currently free for both buyers and property owners. We may introduce premium features in the future, but basic functionality will always remain free.",
  },
  {
    category: "general",
    question: "How is this different from TradeMe or real estate websites?",
    answer:
      "Traditional platforms show properties already listed for sale. OffMarket NZ flips this - buyers express what they want, and owners can discover demand before deciding to sell. This creates off-market opportunities and helps match motivated parties.",
  },
  {
    category: "general",
    question: "Is my information secure?",
    answer:
      "Yes, we take privacy seriously. Your contact details are only shared when you choose to connect with another user. Property addresses are kept private for owners, and buyer criteria is anonymized in public listings.",
  },

  // Buyers
  {
    category: "buyers",
    question: "How do I register my interest in a property?",
    answer:
      "Click 'Register Interest' from the header menu. You can specify your budget, preferred property type, bedroom requirements, desired locations (specific addresses or general areas), and any features you're looking for.",
  },
  {
    category: "buyers",
    question: "Can I target a specific address?",
    answer:
      "Yes! When registering your interest, you can target specific addresses you're interested in. Property owners will see your interest (anonymized) and can choose to reach out to you.",
  },
  {
    category: "buyers",
    question: "What happens when my criteria matches a property?",
    answer:
      "If a property owner registers a property that matches your criteria, you'll both be notified of the match. Either party can then initiate contact through our messaging system.",
  },
  {
    category: "buyers",
    question: "Can I change my buyer interest after creating it?",
    answer:
      "Yes, you can edit or delete your buyer interests at any time from the 'My Interests' section in your dashboard.",
  },
  {
    category: "buyers",
    question: "Do property owners see my personal details?",
    answer:
      "No, your identity is protected until you choose to connect. Owners only see your requirements and budget, not your name or contact information, until you agree to share it.",
  },

  // Owners
  {
    category: "owners",
    question: "How do I see if there's demand for my property?",
    answer:
      "Register your property by clicking 'For Owners' or 'Register Property'. Enter your address and property details, and we'll immediately show you how many buyers are looking in your area.",
  },
  {
    category: "owners",
    question: "Do I have to be ready to sell to register?",
    answer:
      "Not at all! Many owners register just to understand the demand. There's no obligation to sell, and you control all communication with potential buyers.",
  },
  {
    category: "owners",
    question: "Is my property address visible to buyers?",
    answer:
      "No, your specific address is never shown publicly. Buyers only see general area information (suburb/city) unless you choose to share more details with them directly.",
  },
  {
    category: "owners",
    question: "How do I contact an interested buyer?",
    answer:
      "From your property detail page, you can see matching buyers and their requirements. Click 'Contact' to send them a message through our secure messaging system.",
  },
  {
    category: "owners",
    question: "Can I register multiple properties?",
    answer:
      "Yes, you can register as many properties as you own. Each property will be matched independently with interested buyers.",
  },
];

export default function HelpPage() {
  const [activeCategory, setActiveCategory] = useState<"all" | "general" | "buyers" | "owners">("all");
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const filteredFaqs =
    activeCategory === "all"
      ? faqs
      : faqs.filter((faq) => faq.category === activeCategory);

  const categoryLabels = {
    all: "All Topics",
    general: "General",
    buyers: "For Buyers",
    owners: "For Owners",
  };

  return (
    <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-display font-bold text-text-base mb-4">Help &amp; FAQ</h1>
        <p className="text-lg text-text-secondary max-w-2xl">
          Find answers to common questions about using OffMarket NZ. Can&apos;t find
          what you&apos;re looking for? Contact us at{" "}
          <a
            href="mailto:support@offmarket.co.nz"
            className="text-accent hover:text-accent-hover"
          >
            support@offmarket.co.nz
          </a>
        </p>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2 justify-start mb-8">
        {(["all", "general", "buyers", "owners"] as const).map((category) => (
          <button
            key={category}
            onClick={() => {
              setActiveCategory(category);
              setOpenIndex(null);
            }}
            className={`px-4 py-2 rounded-sm text-xs font-bold uppercase tracking-wide min-h-[44px] transition-colors ${
              activeCategory === category
                ? "bg-accent text-white"
                : "bg-surface-raised text-text-secondary border border-border hover:bg-surface hover:text-text-base"
            }`}
          >
            {categoryLabels[category]}
          </button>
        ))}
      </div>

      {/* FAQ List */}
      <div className="space-y-3">
        {filteredFaqs.map((faq, index) => (
          <div
            key={index}
            className="card overflow-hidden"
          >
            <button
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
              className="w-full flex items-start justify-between gap-4 text-left p-4"
            >
              <div className="flex items-start gap-3">
                {activeCategory === "all" && (
                  <span
                    className={`text-xs font-medium px-2 py-0.5 rounded-sm flex-shrink-0 ${
                      faq.category === "general"
                        ? "badge-neutral"
                        : faq.category === "buyers"
                          ? "badge-info"
                          : "badge-success"
                    }`}
                  >
                    {faq.category === "general"
                      ? "General"
                      : faq.category === "buyers"
                        ? "Buyers"
                        : "Owners"}
                  </span>
                )}
                <span className="font-medium text-text-base">{faq.question}</span>
              </div>
              <svg
                className={`w-5 h-5 flex-shrink-0 transition-transform ${
                  openIndex === index ? "rotate-180 text-accent" : "text-text-muted"
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
            {openIndex === index && (
              <div className="px-4 pb-4 text-text-secondary">
                <div className="pl-0 sm:pl-12 border-t border-border pt-3">
                  {faq.answer}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mt-12 grid sm:grid-cols-2 gap-4">
        <div className="card p-6">
          <svg
            className="w-8 h-8 text-accent mb-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <h3 className="font-semibold text-text-base mb-2 font-display">Looking to Buy?</h3>
          <p className="text-sm text-text-secondary mb-4">
            Register your interest and we&apos;ll notify you when matching properties become available.
          </p>
          <Link href="/buyer/create" className="btn-primary text-sm">
            Register Interest
          </Link>
        </div>

        <div className="card p-6">
          <svg
            className="w-8 h-8 text-accent mb-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
            />
          </svg>
          <h3 className="font-semibold text-text-base mb-2 font-display">Own Property?</h3>
          <p className="text-sm text-text-secondary mb-4">
            See how many buyers are looking for properties like yours.
          </p>
          <Link href="/owner/register" className="btn-primary text-sm">
            Check Demand
          </Link>
        </div>
      </div>

      {/* Contact Section */}
      <div className="mt-12 p-8 bg-surface-raised rounded-lg">
        <h2 className="text-xl font-semibold text-text-base mb-2 font-display">
          Still have questions?
        </h2>
        <p className="text-text-secondary mb-4">
          Our support team is here to help you.
        </p>
        <a
          href="mailto:support@offmarket.co.nz"
          className="btn-primary inline-flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
          Email Support
        </a>
      </div>
    </div>
  );
}
