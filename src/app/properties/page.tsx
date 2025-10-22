"use client";

import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PropertyCard } from "@/components/properties/PropertyCard";
import { PropertyFilters } from "@/components/properties/PropertyFilters";
import dynamic from "next/dynamic";
import { ModalSkeleton } from "@/components/ui/LoadingSkeletons";

// Dynamic import for heavy modal component
const AddPropertyModal = dynamic(() => import("@/components/properties/AddPropertyModal").then(mod => ({ default: mod.AddPropertyModal })), {
  loading: () => <ModalSkeleton />,
  ssr: false
});
import { Plus, Search, Filter, Grid, List } from "lucide-react";

// Mock data for properties
const mockProperties = [
  {
    id: "1",
    address: "123 Main St",
    city: "Austin",
    state: "TX",
    zipCode: "78701",
    propertyType: "SINGLE_FAMILY",
    bedrooms: 3,
    bathrooms: 2,
    squareFeet: 1800,
    listPrice: 450000,
    marketValue: 475000,
    status: "AVAILABLE",
    images: ["https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20single%20family%20home%20exterior%20with%20front%20yard&image_size=landscape_4_3"],
    features: ["Hardwood Floors", "Updated Kitchen", "Fenced Yard"],
    createdAt: new Date("2024-01-15"),
    offers: []
  },
  {
    id: "2",
    address: "456 Oak Ave",
    city: "Austin",
    state: "TX",
    zipCode: "78702",
    propertyType: "CONDO",
    bedrooms: 2,
    bathrooms: 2,
    squareFeet: 1200,
    listPrice: 320000,
    marketValue: 335000,
    status: "UNDER_CONTRACT",
    images: ["https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20condo%20building%20exterior%20urban%20setting&image_size=landscape_4_3"],
    features: ["Balcony", "Granite Counters", "Pool Access"],
    createdAt: new Date("2024-01-10"),
    offers: [{ id: "1", offerAmount: 315000, status: "ACCEPTED" }]
  },
  {
    id: "3",
    address: "789 Pine Rd",
    city: "Austin",
    state: "TX",
    zipCode: "78703",
    propertyType: "MULTI_FAMILY",
    bedrooms: 6,
    bathrooms: 4,
    squareFeet: 3200,
    listPrice: 680000,
    marketValue: 720000,
    status: "SOLD",
    images: ["https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=duplex%20multi%20family%20home%20with%20separate%20entrances&image_size=landscape_4_3"],
    features: ["Duplex", "Separate Utilities", "Investment Property"],
    createdAt: new Date("2024-01-05"),
    offers: [{ id: "2", offerAmount: 675000, status: "ACCEPTED" }]
  }
];

export default function PropertiesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showAddModal, setShowAddModal] = useState(false);
  const [filters, setFilters] = useState({
    status: "all",
    propertyType: "all",
    priceRange: "all"
  });

  const filteredProperties = mockProperties.filter(property => {
    const matchesSearch = 
      property.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.zipCode.includes(searchTerm);
    
    const matchesStatus = filters.status === "all" || property.status === filters.status;
    const matchesType = filters.propertyType === "all" || property.propertyType === filters.propertyType;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "AVAILABLE": return "bg-red-100 text-red-800";
      case "UNDER_CONTRACT": return "bg-black text-white";
      case "SOLD": return "bg-gray-800 text-white";
      case "OFF_MARKET": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Properties</h1>
            <p className="text-gray-600">Manage your property inventory</p>
          </div>
          <Button onClick={() => setShowAddModal(true)} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            Add Property
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Properties</p>
                  <p className="text-2xl font-bold">{mockProperties.length}</p>
                </div>
                <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 text-sm font-semibold">{mockProperties.length}</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Available</p>
                  <p className="text-2xl font-bold text-green-600">
                    {mockProperties.filter(p => p.status === "AVAILABLE").length}
                  </p>
                </div>
                <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 text-sm font-semibold">
                    {mockProperties.filter(p => p.status === "AVAILABLE").length}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Under Contract</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {mockProperties.filter(p => p.status === "UNDER_CONTRACT").length}
                  </p>
                </div>
                <div className="h-8 w-8 bg-yellow-100 rounded-full flex items-center justify-center">
                  <span className="text-yellow-600 text-sm font-semibold">
                    {mockProperties.filter(p => p.status === "UNDER_CONTRACT").length}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Sold</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {mockProperties.filter(p => p.status === "SOLD").length}
                  </p>
                </div>
                <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 text-sm font-semibold">
                    {mockProperties.filter(p => p.status === "SOLD").length}
                  </span>
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
                placeholder="Search properties..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <PropertyFilters filters={filters} onFiltersChange={setFilters} />
            
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

        {/* Properties Grid/List */}
        <div className={viewMode === "grid" 
          ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
          : "space-y-4"
        }>
          {filteredProperties.map((property) => (
            <PropertyCard
              key={property.id}
              property={property}
              viewMode={viewMode}
            />
          ))}
        </div>

        {filteredProperties.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Search className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No properties found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || filters.status !== "all" || filters.propertyType !== "all"
                ? "Try adjusting your search or filters"
                : "Get started by adding your first property"
              }
            </p>
            <Button onClick={() => setShowAddModal(true)} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Add Property
            </Button>
          </div>
        )}

        {/* Add Property Modal */}
        <AddPropertyModal
          open={showAddModal}
          onOpenChange={setShowAddModal}
        />
      </div>
    </MainLayout>
  );
}