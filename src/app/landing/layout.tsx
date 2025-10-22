import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Flipstack - Real Estate CRM | Streamline Your Deals from Lead to Close",
  description: "The all-in-one CRM built specifically for real estate wholesalers to manage leads, buyers, and deals in one powerful platform. Start your free 4-day trial today.",
  keywords: "real estate CRM, wholesaling, lead management, buyer database, deal tracking, real estate software, property investment, wholesale deals, real estate leads, wholesale CRM",
  openGraph: {
    title: "Flipstack - Real Estate CRM | Streamline Your Deals from Lead to Close",
    description: "The all-in-one CRM built specifically for real estate wholesalers to manage leads, buyers, and deals in one powerful platform.",
    type: "website",
    siteName: "Flipstack",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Flipstack - Real Estate CRM",
    description: "Streamline your real estate deals from lead to close with our powerful CRM platform.",
  },
  alternates: {
    canonical: "https://flipstackk.kevnbenestate.org/landing",
  },
};

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
    </>
  );
}