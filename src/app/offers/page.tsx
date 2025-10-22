"use client";

import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { OfferCard } from "@/components/offers/OfferCard";
import { OfferFilters } from "@/components/offers/OfferFilters";
import dynamic from "next/dynamic";
import { ModalSkeleton } from "@/components/ui/LoadingSkeletons";

// Dynamic import for heavy modal component
const AddOfferModal = dynamic(() => import("@/components/offers/AddOfferModal").then(mod => ({ default: mod.AddOfferModal })), {
  loading: () => <ModalSkeleton />,
  ssr: false
});
import { Plus, Search, Filter, Grid, List, TrendingUp, Clock, CheckCircle, XCircle } from "lucide-react";

// Mock data for offers
const mockOffers = [
  {
    id: "1",
    propertyId: "1",
    property: {
      address: "123 Main St",
      city: "Austin",
      state: "TX",
      zipCode: "78701",
      listPrice: 450000
    },
    buyerName: "John Smith",
    buyerEmail: "john.smith@email.com",
    buyerPhone: "(555) 123-4567",
    offerAmount: 445000,
    earnestMoney: 10000,
    closingDate: new Date("2024-03-15"),
    contingencies: "Inspection, Financing",
    status: "PENDING",
    notes: "First-time buyer, pre-approved for $500K",
    createdAt: new Date("2024-01-20"),
    updatedAt: new Date("2024-01-20")
  },
  {
    id: "2",
    propertyId: "2",
    property: {
      address: "456 Oak Ave",
      city: "Austin",
      state: "TX",
      zipCode: "78702",
      listPrice: 320000
    },
    buyerName: "Sarah Johnson",
    buyerEmail: "sarah.j@email.com",
    buyerPhone: "(555) 987-6543",
    offerAmount: 315000,
    earnestMoney: 5000,
    closingDate: new Date("2024-02-28"),
    contingencies: "Inspection only",
    status: "ACCEPTED",
    notes: "Cash buyer, quick close",
    createdAt: new Date("2024-01-18"),
    updatedAt: new Date("2024-01-19")
  },
  {
    id: "3",
    propertyId: "1",
    property: {
      address: "123 Main St",
      city: "Austin",
      state: "TX",
      zipCode: "78701",
      listPrice: 450000
    },
    buyerName: "Mike Davis",
    buyerEmail: "mike.davis@email.com",
    buyerPhone: "(555) 456-7890",
    offerAmount: 430000,
    earnestMoney: 8000,
    closingDate: new Date("2024-03-01"),
    contingencies: "Inspection, Financing, Appraisal",
    status: "REJECTED",
    notes: "Offer too low, multiple contingencies",
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-01-16")
  },
  {
    id: "4",
    propertyId: "3",
    property: {
      address: "789 Pine Rd",
      city: "Austin",
      state: "TX",
      zipCode: "78703",
      listPrice: 680000
    },
    buyerName: "Lisa Wilson",
    buyerEmail: "lisa.wilson@email.com",
    buyerPhone: "(555) 321-0987",
    offerAmount: 675000,
    earnestMoney: 15000,
    closingDate: new Date("2024-02-15"),
    contingencies: "Inspection",
    status: "COUNTERED",
    notes: "Counter offer at $690K",
    createdAt: new Date("2024-01-12"),
    updatedAt: new Date("2024-01-14")
  }
];

export default function OffersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [showAddModal, setShowAddModal] = useState(false);
  const [filters, setFilters] = useState({
    status: "all",
    propertyId: "all",
    dateRange: "all"
  });

  const filteredOffers = mockOffers.filter(offer => {
    const matchesSearch = 
      offer.buyerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      offer.property.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      offer.buyerEmail.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filters.status === "all" || offer.status === filters.status;
    const matchesProperty = filters.propertyId === "all" || offer.propertyId === filters.propertyId;
    
    return matchesSearch && matchesStatus && matchesProperty;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING": return "bg-red-100 text-red-800";
      case "ACCEPTED": return "bg-black text-white";
      case "REJECTED": return "bg-gray-800 text-white";
      case "COUNTERED": return "bg-gray-600 text-white";
      case "WITHDRAWN": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PENDING": return <Clock className="h-4 w-4" />;
      case "ACCEPTED": return <CheckCircle className="h-4 w-4" />;
      case "REJECTED": return <XCircle className="h-4 w-4" />;
      case "COUNTERED": return <TrendingUp className="h-4 w-4" />;
      case "WITHDRAWN": return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const totalOfferValue = mockOffers.reduce((sum, offer) => sum + offer.offerAmount, 0);
  const averageOfferAmount = totalOfferValue / mockOffers.length;

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Offers</h1>
            <p className="text-gray-600">Manage property offers and negotiations</p>
          </div>
          <Button onClick={() => setShowAddModal(true)} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            Add Offer
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Offers</p>
                  <p className="text-2xl font-bold">{mockOffers.length}</p>
                </div>
                <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 text-sm font-semibold">{mockOffers.length}</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {mockOffers.filter(o => o.status === "PENDING").length}
                  </p>
                </div>
                <div className="h-8 w-8 bg-yellow-100 rounded-full flex items-center justify-center">
                  <Clock className="h-4 w-4 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Accepted</p>
                  <p className="text-2xl font-bold text-green-600">
                    {mockOffers.filter(o => o.status === "ACCEPTED").length}
                  </p>
                </div>
                <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Avg. Offer</p>
                  <p className="text-2xl font-bold text-blue-600">
                    ${Math.round(averageOfferAmount / 1000)}K
                  </p>
                </div>
                <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search offers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <OfferFilters filters={filters} onFiltersChange={setFilters} />
            
            <div className="flex items-center border rounded-lg">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className="rounded-r-none"
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
                className="rounded-l-none"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Offers Grid/List */}
        <div className={viewMode === "grid" 
          ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
          : "space-y-4"
        }>
          {filteredOffers.map((offer) => (
            <OfferCard
              key={offer.id}
              offer={offer}
              viewMode={viewMode}
              getStatusColor={getStatusColor}
              getStatusIcon={getStatusIcon}
            />
          ))}
        </div>

        {filteredOffers.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Search className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No offers found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || filters.status !== "all" || filters.propertyId !== "all"
                ? "Try adjusting your search or filters"
                : "Get started by adding your first offer"
              }
            </p>
            <Button onClick={() => setShowAddModal(true)} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Add Offer
            </Button>
          </div>
        )}

        {/* Add Offer Modal */}
        <AddOfferModal
          open={showAddModal}
          onOpenChange={setShowAddModal}
        />
      </div>
    </MainLayout>
  );
}