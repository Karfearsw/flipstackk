"use client";

import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { MainLayout } from "@/components/layout/MainLayout";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { KPIGrid } from "@/components/dashboard/widgets/KPIGrid";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { DashboardFilters, DashboardFilters as DashboardFiltersType } from "@/components/dashboard/filters/DashboardFilters";
import { useRealTimeData } from "@/hooks/useRealTimeData";
import { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { ChartSkeleton } from "@/components/ui/LoadingSkeletons";
import Link from "next/link";
import {
  Users,
  Building,
  CheckSquare,
  FileText,
  Plus,
} from "lucide-react";

// Dynamic imports for heavy chart components
const LeadsChart = dynamic(() => import("@/components/dashboard/charts/LeadsChart").then(mod => ({ default: mod.LeadsChart })), {
  loading: () => <ChartSkeleton />,
  ssr: false
});

const TasksChart = dynamic(() => import("@/components/dashboard/charts/TasksChart").then(mod => ({ default: mod.TasksChart })), {
  loading: () => <ChartSkeleton />,
  ssr: false
});

const BuyersChart = dynamic(() => import("@/components/dashboard/charts/BuyersChart").then(mod => ({ default: mod.BuyersChart })), {
  loading: () => <ChartSkeleton />,
  ssr: false
});

const RevenuePipelineChart = dynamic(() => import("@/components/dashboard/charts/RevenuePipelineChart").then(mod => ({ default: mod.RevenuePipelineChart })), {
  loading: () => <ChartSkeleton />,
  ssr: false
});

export default function DashboardPage() {
  const { data: session } = useSession();
  const [filters, setFilters] = useState<DashboardFiltersType>({});
  const [isGuestUser, setIsGuestUser] = useState(false);
  const router = useRouter();
  
  // Check for guest access
  useEffect(() => {
    const guestAccess = localStorage.getItem('guestAccess');
    if (guestAccess === 'true') {
      setIsGuestUser(true);
    } else if (!session) {
      // If no session and no guest access, redirect to login
      router.push('/login');
    }
  }, [session, router]);
  
  // Enable real-time data updates
  useRealTimeData({
    enabled: true,
    interval: 30000, // 30 seconds
  });

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Dashboard Header with Real-time Controls */}
        <DashboardHeader />

        {/* Live KPI Grid */}
        <KPIGrid />

        {/* Main Dashboard Content */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Left Column - Charts and Analytics */}
          <div className="xl:col-span-3 space-y-6">
            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Suspense fallback={<ChartSkeleton />}>
                <LeadsChart />
              </Suspense>
              <Suspense fallback={<ChartSkeleton />}>
                <TasksChart />
              </Suspense>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Suspense fallback={<ChartSkeleton />}>
                <BuyersChart />
              </Suspense>
              <Suspense fallback={<ChartSkeleton />}>
                <RevenuePipelineChart />
              </Suspense>
            </div>
          </div>

          {/* Right Column - Filters and Activity */}
          <div className="xl:col-span-1 space-y-6">
            {/* Dashboard Filters */}
            <DashboardFilters 
              onFiltersChange={setFilters}
              className="sticky top-6"
            />
            
            {/* Activity Feed */}
            <ActivityFeed />
          </div>
        </div>

        {/* Quick Actions Section */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-black">Quick Actions</h3>
              <p className="text-sm text-gray-600">Common tasks and shortcuts</p>
            </div>
            <Plus className="h-5 w-5 text-gray-400" />
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button 
              variant="outline" 
              className="h-24 flex-col bg-white hover:bg-gray-50 border-2 border-dashed border-gray-200 hover:border-red-300"
              asChild
            >
              <Link href="/leads/new">
                <Users className="h-8 w-8 mb-2 text-red-600" />
                <span className="text-sm font-medium">Add Lead</span>
              </Link>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-24 flex-col bg-white hover:bg-gray-50 border-2 border-dashed border-gray-200 hover:border-black"
              asChild
            >
              <Link href="/buyers/new">
                <Building className="h-8 w-8 mb-2 text-black" />
                <span className="text-sm font-medium">Add Buyer</span>
              </Link>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-24 flex-col bg-white hover:bg-gray-50 border-2 border-dashed border-gray-200 hover:border-red-300"
              asChild
            >
              <Link href="/tasks/new">
                <CheckSquare className="h-8 w-8 mb-2 text-red-600" />
                <span className="text-sm font-medium">Create Task</span>
              </Link>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-24 flex-col bg-white hover:bg-gray-50 border-2 border-dashed border-gray-200 hover:border-black"
              asChild
            >
              <Link href="/offers/new">
                <FileText className="h-8 w-8 mb-2 text-black" />
                <span className="text-sm font-medium">New Offer</span>
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}