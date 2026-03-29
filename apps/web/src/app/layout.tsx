import type { Metadata } from "next";
import { generalSans, dmSans, jetbrainsMono } from "./fonts";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

export const metadata: Metadata = {
  title: {
    default: "OffMarket NZ - Find Your Dream Home Before It Hits the Market",
    template: "%s | OffMarket NZ",
  },
  description:
    "New Zealand's first reverse real estate marketplace. Buyers post what they want, property owners see demand. Connect directly without listing publicly. Free for buyers.",
  keywords: [
    "real estate",
    "property",
    "New Zealand",
    "house hunting",
    "off market",
    "private sale",
    "buy house NZ",
    "sell house NZ",
    "property marketplace",
    "Auckland property",
    "Wellington property",
    "Christchurch property",
  ],
  authors: [{ name: "OffMarket NZ" }],
  creator: "OffMarket NZ",
  publisher: "OffMarket NZ",
  openGraph: {
    type: "website",
    locale: "en_NZ",
    siteName: "OffMarket NZ",
    title: "OffMarket NZ - Find Your Dream Home Before It Hits the Market",
    description:
      "New Zealand's first reverse real estate marketplace. Buyers post what they want, property owners see demand. Connect directly without listing publicly.",
  },
  twitter: {
    card: "summary_large_image",
    title: "OffMarket NZ - Find Your Dream Home Before It Hits the Market",
    description:
      "New Zealand's first reverse real estate marketplace. Buyers post what they want, property owners see demand.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${generalSans.variable} ${dmSans.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <body className="font-sans bg-bg text-text-base antialiased">
        <Providers>
          <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
