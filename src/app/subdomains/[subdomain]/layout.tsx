import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../../globals.css";
import ClientProviders from "@/components/providers/ClientProviders";
import { getCanonicalUrl } from "@/lib/domain";

const inter = Inter({ 
  subsets: ["latin"],
  display: 'swap',
  preload: true,
});

interface SubdomainLayoutProps {
  children: React.ReactNode;
  params: Promise<{ subdomain: string }>;
}

export async function generateMetadata({ params }: { params: Promise<{ subdomain: string }> }): Promise<Metadata> {
  const { subdomain } = await params;
  const canonicalUrl = getCanonicalUrl();
  
  const baseTitle = "Flipstack - Real Estate CRM | Streamline Your Deals from Lead to Close";
  const baseDescription = "The all-in-one CRM built specifically for real estate wholesalers to manage leads, buyers, and deals in one powerful platform.";
  
  const title = `${subdomain.charAt(0).toUpperCase() + subdomain.slice(1)} - ${baseTitle}`;
  const description = `${baseDescription} Access your dedicated ${subdomain} workspace.`;
  
  return {
    title,
    description,
    keywords: "real estate CRM, wholesaling, lead management, buyer database, deal tracking, real estate software, property investment, wholesale deals",
    authors: [{ name: "Flipstack Team" }],
    viewport: "width=device-width, initial-scale=1",
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
      title: `${subdomain} - Flipstack CRM`,
      description: `Access your dedicated ${subdomain} workspace on Flipstack CRM.`,
    },
    alternates: {
      canonical: canonicalUrl,
    },
    other: {
      'subdomain-config': JSON.stringify({
        subdomain,
        isSubdomain: true,
        parentDomain: 'kevnbenestate.org',
      }),
    },
  };
}

export default async function SubdomainLayout({ children, params }: SubdomainLayoutProps) {
  const { subdomain } = await params;
  
  return (
    <html lang="en" className="h-full">
      <head>
        {/* Subdomain-specific meta tags */}
        <meta name="subdomain" content={subdomain} />
        <meta name="subdomain-type" content="workspace" />
        
        {/* Preload critical resources */}
        <link rel="preload" href="/fonts/inter-var.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        
        {/* DNS prefetch for external domains */}
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="dns-prefetch" href="//fonts.gstatic.com" />
        
        {/* Preconnect to critical third-party origins */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* Subdomain-specific resource hints */}
        <link rel="prefetch" href={`/api/subdomains/${subdomain}/dashboard/stats`} />
        <link rel="prefetch" href={`/api/subdomains/${subdomain}/leads`} />
        
        {/* Subdomain performance monitoring */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.__SUBDOMAIN__ = '${subdomain}';
              window.__PERFORMANCE_START__ = Date.now();
              
              // Subdomain-specific performance monitoring
              if ('PerformanceObserver' in window) {
                try {
                  const longTaskObserver = new PerformanceObserver((list) => {
                    for (const entry of list.getEntries()) {
                      if (entry.duration > 50) {
                        console.warn('[${subdomain}] Long task detected:', entry.duration + 'ms');
                      }
                    }
                  });
                  longTaskObserver.observe({ entryTypes: ['longtask'] });
                  
                  const clsObserver = new PerformanceObserver((list) => {
                    for (const entry of list.getEntries()) {
                      if (!entry.hadRecentInput) {
                        console.warn('[${subdomain}] Layout shift detected:', entry.value);
                      }
                    }
                  });
                  clsObserver.observe({ entryTypes: ['layout-shift'] });
                } catch (e) {
                  console.warn('[${subdomain}] Performance observers not supported');
                }
              }
              
              // Subdomain error tracking
              window.addEventListener('error', (e) => {
                console.error('[${subdomain}] JavaScript error:', e.error);
              });
              
              window.addEventListener('unhandledrejection', (e) => {
                console.error('[${subdomain}] Unhandled promise rejection:', e.reason);
              });
            `,
          }}
        />
        
        {/* Viewport meta for mobile optimization */}
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        
        {/* Theme color for mobile browsers */}
        <meta name="theme-color" content="#ffffff" />
        
        {/* Manifest for PWA capabilities */}
        <link rel="manifest" href="/manifest.json" />
        
        {/* Favicon and app icons */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body className={`${inter.className} h-full bg-background antialiased`} data-subdomain={subdomain}>
        <ClientProviders>
          <div className="subdomain-wrapper" data-subdomain={subdomain}>
            {children}
          </div>
        </ClientProviders>
        
        {/* Subdomain performance monitoring initialization */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.addEventListener('load', () => {
                if (typeof window !== 'undefined' && window.__PERFORMANCE_MONITOR__) {
                  window.__PERFORMANCE_MONITOR__.init('${subdomain}');
                }
              });
            `,
          }}
        />
      </body>
    </html>
  );
}