"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { NavigationHeader } from "./NavigationHeader";

interface MainLayoutProps {
  children: React.ReactNode;
  showNavigationHeader?: boolean;
  navigationTitle?: string;
  showBackButton?: boolean;
  customBackPath?: string;
  breadcrumbs?: Array<{ label: string; href?: string }>;
}

export function MainLayout({ 
  children, 
  showNavigationHeader = true,
  navigationTitle,
  showBackButton = true,
  customBackPath,
  breadcrumbs 
}: MainLayoutProps) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return; // Still loading
    
    // Check for guest access
    const guestAccess = localStorage.getItem('guestAccess');
    if (guestAccess === 'true') {
      return; // Allow guest access
    }
    
    if (!session) {
      router.push("/login");
      return;
    }
  }, [session, status, router]);

  if (status === "loading") {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Check for guest access
  const guestAccess = localStorage.getItem('guestAccess');
  if (!session && guestAccess !== 'true') {
    return null; // Will redirect to login
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        {showNavigationHeader && (
          <NavigationHeader
            title={navigationTitle}
            showBackButton={showBackButton}
            customBackPath={customBackPath}
            breadcrumbs={breadcrumbs}
          />
        )}
        <main className="flex-1 overflow-y-auto">
          <div className="py-6">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}