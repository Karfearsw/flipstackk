"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  Home, 
  Users, 
  Calendar,
  Download,
  Filter,
  RefreshCw
} from "lucide-react";
import { ReportsFilters } from "@/components/reports/ReportsFilters";
import { ReportsTable } from "@/components/reports/ReportsTable";
import dynamic from "next/dynamic";
import { Suspense } from "react";
import { ChartSkeleton } from "@/components/ui/LoadingSkeletons";

// Dynamic import for heavy charts component
const ReportsCharts = dynamic(() => import("@/components/reports/ReportsCharts"), {
  loading: () => <ChartSkeleton />,
  ssr: false
});

// Mock data for reports
const mockMetrics = {
  totalRevenue: 2450000,
  totalProperties: 45,
  activeOffers: 12,
  closedDeals: 8,
  averageDaysOnMarket: 28,
  conversionRate: 18.5
};

const mockChartData = {
  monthlyRevenue: [
    { month: "Jan", revenue: 180000, deals: 3 },
    { month: "Feb", revenue: 220000, deals: 4 },
    { month: "Mar", revenue: 195000, deals: 3 },
    { month: "Apr", revenue: 285000, deals: 5 },
    { month: "May", revenue: 310000, deals: 6 },
    { month: "Jun", revenue: 275000, deals: 4 }
  ],
  propertyTypes: [
    { type: "Single Family", count: 18, percentage: 40 },
    { type: "Condo", count: 12, percentage: 27 },
    { type: "Townhouse", count: 8, percentage: 18 },
    { type: "Multi-Family", count: 7, percentage: 15 }
  ],
  offerStatus: [
    { status: "Accepted", count: 8, percentage: 35 },
    { status: "Pending", count: 12, percentage: 52 },
    { status: "Rejected", count: 3, percentage: 13 }
  ]
};

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState("6months");
  const [reportType, setReportType] = useState("overview");
  const [isLoading, setIsLoading] = useState(false);

  const handleExport = (format: string) => {
    setIsLoading(true);
    // Simulate export process
    setTimeout(() => {
      setIsLoading(false);
      // In a real app, this would trigger a download
      console.log(`Exporting report as ${format}`);
    }, 2000);
  };

  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-600 mt-1">
            Track your performance and analyze business metrics
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          
          <Select value={reportType} onValueChange={setReportType}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="overview">Overview</SelectItem>
              <SelectItem value="properties">Properties</SelectItem>
              <SelectItem value="offers">Offers</SelectItem>
              <SelectItem value="financial">Financial</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="30days">30 Days</SelectItem>
              <SelectItem value="3months">3 Months</SelectItem>
              <SelectItem value="6months">6 Months</SelectItem>
              <SelectItem value="1year">1 Year</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${mockMetrics.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+12.5%</span> from last period
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Properties</CardTitle>
            <Home className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockMetrics.totalProperties}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+3</span> this month
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Offers</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockMetrics.activeOffers}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-blue-600">+2</span> from yesterday
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Closed Deals</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockMetrics.closedDeals}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+1</span> this week
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Days on Market</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockMetrics.averageDaysOnMarket}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">-3 days</span> improvement
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockMetrics.conversionRate}%</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+2.1%</span> from last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <ReportsCharts data={mockChartData} />

      {/* Export Options */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Export Reports
          </CardTitle>
          <CardDescription>
            Download your reports in various formats for external analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button 
              variant="outline" 
              onClick={() => handleExport('pdf')}
              disabled={isLoading}
            >
              <Download className="h-4 w-4 mr-2" />
              Export as PDF
            </Button>
            <Button 
              variant="outline" 
              onClick={() => handleExport('excel')}
              disabled={isLoading}
            >
              <Download className="h-4 w-4 mr-2" />
              Export as Excel
            </Button>
            <Button 
              variant="outline" 
              onClick={() => handleExport('csv')}
              disabled={isLoading}
            >
              <Download className="h-4 w-4 mr-2" />
              Export as CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Reports Table */}
      <ReportsTable reportType={reportType} dateRange={dateRange} />
    </div>
  );
}