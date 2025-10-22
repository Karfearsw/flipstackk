import type { Metadata } from "next";
import { Inter, Orbitron } from "next/font/google";
import "./globals.css";
import ClientProviders from "@/components/providers/ClientProviders";
import { getDomainConfig, getCanonicalUrl } from "@/lib/domain";

const inter = Inter({ 
  subsets: ["latin"],
  display: 'swap',
  preload: true,
});

const orbitron = Orbitron({
  subsets: ["latin"],
  display: 'swap',
  variable: '--font-orbitron',
});

export async function generateViewport() {
  return {
    width: 'device-width',
    initialScale: 1,
    viewportFit: 'cover',
  };
}

export async function generateMetadata(): Promise<Metadata> {
  const domainConfig = await getDomainConfig();
  const canonicalUrl = getCanonicalUrl();
  
  // Domain-specific metadata
  const baseTitle = "Flipstack - Real Estate CRM | Streamline Your Deals from Lead to Close";
  const baseDescription = "The all-in-one CRM built specifically for real estate wholesalers to manage leads, buyers, and deals in one powerful platform. Start your free 4-day trial today.";
  
  let title = baseTitle;
  let description = baseDescription;
  
  // Customize metadata for subdomains if needed
  if (domainConfig.isSubdomain && domainConfig.subdomain) {
    title = `${domainConfig.subdomain.charAt(0).toUpperCase() + domainConfig.subdomain.slice(1)} - ${baseTitle}`;
    description = `${baseDescription} Access your dedicated ${domainConfig.subdomain} workspace.`;
  }
  
  return {
    title,
    description,
    keywords: "real estate CRM, wholesaling, lead management, buyer database, deal tracking, real estate software, property investment, wholesale deals",
    authors: [{ name: "Flipstack Team" }],
    robots: "index, follow",
    openGraph: {
      title,
      description,
      type: "website",
      siteName: "Flipstack",
      locale: "en_US",
      url: canonicalUrl,
    },
    twitter: {
      card: "summary_large_image",
      title: "Flipstack - Real Estate CRM",
      description: "Streamline your real estate deals from lead to close with our powerful CRM platform.",
    },
    alternates: {
      canonical: canonicalUrl,
    },
    other: {
      'domain-config': JSON.stringify({
        domain: domainConfig.domain,
        subdomain: domainConfig.subdomain,
        isMainDomain: domainConfig.isMainDomain,
        baseUrl: domainConfig.baseUrl,
      }),
    },
  };
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <head>
        {/* Preload critical resources */}
        <link rel="preload" href="/fonts/inter-var.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        
        {/* DNS prefetch for external domains */}
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="dns-prefetch" href="//fonts.gstatic.com" />
        
        {/* Preconnect to critical third-party origins */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* Resource hints for performance */}
        <link rel="prefetch" href="/api/dashboard/stats" />
        <link rel="prefetch" href="/api/leads" />
        
        {/* Performance monitoring script - load early but non-blocking */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Early performance monitoring setup
              window.__PERFORMANCE_START__ = Date.now();
              
              // Critical performance observer setup
              if ('PerformanceObserver' in window) {
                try {
                  // Long Task Observer
                  const longTaskObserver = new PerformanceObserver((list) => {
                    for (const entry of list.getEntries()) {
                      if (entry.duration > 50) {
                        console.warn('Long task detected:', entry.duration + 'ms');
                      }
                    }
                  });
                  longTaskObserver.observe({ entryTypes: ['longtask'] });
                  
                  // Layout Shift Observer
                  const clsObserver = new PerformanceObserver((list) => {
                    for (const entry of list.getEntries()) {
                      if (!entry.hadRecentInput) {
                        console.warn('Layout shift detected:', entry.value);
                      }
                    }
                  });
                  clsObserver.observe({ entryTypes: ['layout-shift'] });
                } catch (e) {
                  console.warn('Performance observers not supported');
                }
              }
              
              // Error tracking
              window.addEventListener('error', (e) => {
                console.error('JavaScript error:', e.error);
              });
              
              window.addEventListener('unhandledrejection', (e) => {
                console.error('Unhandled promise rejection:', e.reason);
              });
            `,
          }}
        />
        

        
        {/* Theme color for mobile browsers */}
        <meta name="theme-color" content="#ffffff" />
        
        {/* Manifest for PWA capabilities */}
        <link rel="manifest" href="/manifest.json" />
        
        {/* Favicon and app icons */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body className={`${inter.className} ${orbitron.variable} h-full bg-background antialiased`}>
        <ClientProviders>
          {children}
        </ClientProviders>
        
        {/* Performance monitoring initialization */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Initialize performance monitoring after page load
              window.addEventListener('load', () => {
                if (typeof window !== 'undefined' && window.__PERFORMANCE_MONITOR__) {
                  window.__PERFORMANCE_MONITOR__.init();
                }
              });
            `,
          }}
        />
      </body>
    </html>
  );
}
