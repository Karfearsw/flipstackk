"use client";

import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Home, ChevronRight } from "lucide-react";
import Link from "next/link";

interface NavigationHeaderProps {
  title?: string;
  showBackButton?: boolean;
  customBackPath?: string;
  breadcrumbs?: Array<{ label: string; href?: string }>;
}

export function NavigationHeader({ 
  title, 
  showBackButton = true, 
  customBackPath,
  breadcrumbs 
}: NavigationHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();

  const handleBack = () => {
    if (customBackPath) {
      router.push(customBackPath);
    } else {
      router.back();
    }
  };

  const generateBreadcrumbs = () => {
    if (breadcrumbs) return breadcrumbs;

    const pathSegments = pathname.split('/').filter(Boolean);
    const crumbs = [{ label: 'Dashboard', href: '/dashboard' }];

    let currentPath = '';
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      
      // Skip dynamic route segments like [id]
      if (segment.startsWith('[') && segment.endsWith(']')) {
        return;
      }

      let label = segment.charAt(0).toUpperCase() + segment.slice(1);
      
      // Handle specific route names
      switch (segment) {
        case 'leads':
          label = 'Leads';
          break;
        case 'buyers':
          label = 'Buyers';
          break;
        case 'properties':
          label = 'Properties';
          break;
        case 'tasks':
          label = 'Tasks';
          break;
        case 'offers':
          label = 'Offers';
          break;
        case 'reports':
          label = 'Reports';
          break;
        case 'settings':
          label = 'Settings';
          break;
        case 'new':
          label = 'New';
          break;
        case 'calendar':
          label = 'Calendar';
          break;
        case 'preferences':
          label = 'Preferences';
          break;
      }

      crumbs.push({
        label,
        href: index === pathSegments.length - 1 ? undefined : currentPath
      });
    });

    return crumbs;
  };

  const breadcrumbItems = generateBreadcrumbs();

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {showBackButton && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </Button>
          )}
          
          <div className="flex items-center space-x-2">
            {breadcrumbItems.map((crumb, index) => (
              <div key={index} className="flex items-center space-x-2">
                {index === 0 && <Home className="h-4 w-4 text-gray-400" />}
                {crumb.href ? (
                  <Link
                    href={crumb.href}
                    className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="text-sm font-medium text-gray-900">
                    {crumb.label}
                  </span>
                )}
                {index < breadcrumbItems.length - 1 && (
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <Link href="/dashboard">
            <Button variant="outline" size="sm" className="flex items-center space-x-2">
              <Home className="h-4 w-4" />
              <span>Dashboard</span>
            </Button>
          </Link>
        </div>
      </div>
      
      {title && (
        <div className="mt-4">
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        </div>
      )}
    </div>
  );
}