"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Bed, 
  Bath, 
  Square, 
  MapPin, 
  DollarSign, 
  Eye, 
  Edit,
  MoreHorizontal
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Property {
  id: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  propertyType: string;
  bedrooms?: number;
  bathrooms?: number;
  squareFeet?: number;
  listPrice?: number;
  marketValue?: number;
  status: string;
  images: string[];
  features: string[];
  createdAt: Date;
  offers: any[];
}

interface PropertyCardProps {
  property: Property;
  viewMode: "grid" | "list";
}

export function PropertyCard({ property, viewMode }: PropertyCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "AVAILABLE": return "bg-green-100 text-green-800";
      case "UNDER_CONTRACT": return "bg-yellow-100 text-yellow-800";
      case "SOLD": return "bg-blue-100 text-blue-800";
      case "OFF_MARKET": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const formatPrice = (price?: number) => {
    if (!price) return "N/A";
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatPropertyType = (type: string) => {
    return type.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };

  if (viewMode === "list") {
    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
              <img
                src={property.images[0] || "https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=house%20placeholder%20image&image_size=square"}
                alt={property.address}
                className="w-full h-full object-cover"
              />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-lg text-gray-900 truncate">
                    {property.address}
                  </h3>
                  <p className="text-gray-600 flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    {property.city}, {property.state} {property.zipCode}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={getStatusColor(property.status)}>
                    {property.status.replace(/_/g, ' ')}
                  </Badge>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Property
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              
              <div className="mt-2 flex items-center gap-4 text-sm text-gray-600">
                <span className="flex items-center">
                  <Bed className="h-4 w-4 mr-1" />
                  {property.bedrooms || 0} bed
                </span>
                <span className="flex items-center">
                  <Bath className="h-4 w-4 mr-1" />
                  {property.bathrooms || 0} bath
                </span>
                <span className="flex items-center">
                  <Square className="h-4 w-4 mr-1" />
                  {property.squareFeet?.toLocaleString() || 'N/A'} sq ft
                </span>
                <span className="text-blue-600 font-medium">
                  {formatPropertyType(property.propertyType)}
                </span>
              </div>
              
              <div className="mt-2 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-lg font-bold text-gray-900">
                    {formatPrice(property.listPrice)}
                  </span>
                  {property.offers.length > 0 && (
                    <Badge variant="outline" className="text-xs">
                      {property.offers.length} offer{property.offers.length !== 1 ? 's' : ''}
                    </Badge>
                  )}
                </div>
                <div className="text-sm text-gray-500">
                  Added {property.createdAt.toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
      <div className="aspect-video relative overflow-hidden rounded-t-lg">
        <img
          src={property.images[0] || "https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=house%20placeholder%20image&image_size=landscape_4_3"}
          alt={property.address}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-3 left-3">
          <Badge className={getStatusColor(property.status)}>
            {property.status.replace(/_/g, ' ')}
          </Badge>
        </div>
        <div className="absolute top-3 right-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="sm" className="bg-white/90 hover:bg-white">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Edit className="h-4 w-4 mr-2" />
                Edit Property
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        {property.offers.length > 0 && (
          <div className="absolute bottom-3 left-3">
            <Badge variant="secondary" className="bg-white/90">
              {property.offers.length} offer{property.offers.length !== 1 ? 's' : ''}
            </Badge>
          </div>
        )}
      </div>
      
      <CardContent className="p-4">
        <div className="space-y-3">
          <div>
            <h3 className="font-semibold text-lg text-gray-900 truncate">
              {property.address}
            </h3>
            <p className="text-gray-600 flex items-center text-sm">
              <MapPin className="h-4 w-4 mr-1" />
              {property.city}, {property.state} {property.zipCode}
            </p>
          </div>
          
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span className="flex items-center">
              <Bed className="h-4 w-4 mr-1" />
              {property.bedrooms || 0}
            </span>
            <span className="flex items-center">
              <Bath className="h-4 w-4 mr-1" />
              {property.bathrooms || 0}
            </span>
            <span className="flex items-center">
              <Square className="h-4 w-4 mr-1" />
              {property.squareFeet?.toLocaleString() || 'N/A'}
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-gray-900">
              {formatPrice(property.listPrice)}
            </span>
            <Badge variant="outline" className="text-xs">
              {formatPropertyType(property.propertyType)}
            </Badge>
          </div>
          
          {property.features.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {property.features.slice(0, 2).map((feature, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {feature}
                </Badge>
              ))}
              {property.features.length > 2 && (
                <Badge variant="secondary" className="text-xs">
                  +{property.features.length - 2} more
                </Badge>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}