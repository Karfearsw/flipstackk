"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  MapPin, 
  DollarSign, 
  Calendar, 
  User, 
  Phone, 
  Mail,
  FileText,
  MoreHorizontal,
  Eye,
  Edit,
  MessageSquare
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Offer {
  id: string;
  propertyId: string;
  property: {
    address: string;
    city: string;
    state: string;
    zipCode: string;
    listPrice: number;
  };
  buyerName: string;
  buyerEmail: string;
  buyerPhone: string;
  offerAmount: number;
  earnestMoney?: number;
  closingDate?: Date;
  contingencies?: string;
  status: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface OfferCardProps {
  offer: Offer;
  viewMode: "grid" | "list";
  getStatusColor: (status: string) => string;
  getStatusIcon: (status: string) => React.ReactNode;
}

export function OfferCard({ offer, viewMode, getStatusColor, getStatusIcon }: OfferCardProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (date?: Date) => {
    if (!date) return "N/A";
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getOfferPercentage = () => {
    return ((offer.offerAmount / offer.property.listPrice) * 100).toFixed(1);
  };

  if (viewMode === "list") {
    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-semibold text-lg text-gray-900">
                    {offer.buyerName}
                  </h3>
                  <p className="text-gray-600 flex items-center text-sm">
                    <MapPin className="h-4 w-4 mr-1" />
                    {offer.property.address}, {offer.property.city}, {offer.property.state}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={getStatusColor(offer.status)}>
                    <span className="mr-1">{getStatusIcon(offer.status)}</span>
                    {offer.status.replace(/_/g, ' ')}
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
                        Edit Offer
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Contact Buyer
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Offer Amount</p>
                  <p className="font-semibold text-lg text-green-600">
                    {formatPrice(offer.offerAmount)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {getOfferPercentage()}% of list
                  </p>
                </div>
                
                <div>
                  <p className="text-gray-500">List Price</p>
                  <p className="font-medium">
                    {formatPrice(offer.property.listPrice)}
                  </p>
                </div>
                
                <div>
                  <p className="text-gray-500">Earnest Money</p>
                  <p className="font-medium">
                    {offer.earnestMoney ? formatPrice(offer.earnestMoney) : "N/A"}
                  </p>
                </div>
                
                <div>
                  <p className="text-gray-500">Closing Date</p>
                  <p className="font-medium">
                    {formatDate(offer.closingDate)}
                  </p>
                </div>
              </div>
              
              <div className="mt-3 flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span className="flex items-center">
                    <Mail className="h-4 w-4 mr-1" />
                    {offer.buyerEmail}
                  </span>
                  <span className="flex items-center">
                    <Phone className="h-4 w-4 mr-1" />
                    {offer.buyerPhone}
                  </span>
                </div>
                <div className="text-sm text-gray-500">
                  {formatDate(offer.createdAt)}
                </div>
              </div>
              
              {offer.contingencies && (
                <div className="mt-2">
                  <p className="text-xs text-gray-500">Contingencies:</p>
                  <p className="text-sm text-gray-700">{offer.contingencies}</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold text-lg text-gray-900">
              {offer.buyerName}
            </h3>
            <p className="text-gray-600 flex items-center text-sm">
              <MapPin className="h-4 w-4 mr-1" />
              {offer.property.address}
            </p>
            <p className="text-gray-500 text-sm">
              {offer.property.city}, {offer.property.state} {offer.property.zipCode}
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Badge className={getStatusColor(offer.status)}>
              <span className="mr-1">{getStatusIcon(offer.status)}</span>
              {offer.status.replace(/_/g, ' ')}
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
                  Edit Offer
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Contact Buyer
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Offer Amount</p>
            <p className="text-xl font-bold text-green-600">
              {formatPrice(offer.offerAmount)}
            </p>
            <p className="text-xs text-gray-500">
              {getOfferPercentage()}% of list price
            </p>
          </div>
          
          <div>
            <p className="text-sm text-gray-500">List Price</p>
            <p className="text-lg font-semibold text-gray-900">
              {formatPrice(offer.property.listPrice)}
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500">Earnest Money</p>
            <p className="font-medium">
              {offer.earnestMoney ? formatPrice(offer.earnestMoney) : "N/A"}
            </p>
          </div>
          
          <div>
            <p className="text-gray-500">Closing Date</p>
            <p className="font-medium">
              {formatDate(offer.closingDate)}
            </p>
          </div>
        </div>
        
        <div className="space-y-2 text-sm">
          <div className="flex items-center text-gray-600">
            <Mail className="h-4 w-4 mr-2" />
            {offer.buyerEmail}
          </div>
          <div className="flex items-center text-gray-600">
            <Phone className="h-4 w-4 mr-2" />
            {offer.buyerPhone}
          </div>
        </div>
        
        {offer.contingencies && (
          <div>
            <p className="text-xs text-gray-500 mb-1">Contingencies:</p>
            <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded">
              {offer.contingencies}
            </p>
          </div>
        )}
        
        {offer.notes && (
          <div>
            <p className="text-xs text-gray-500 mb-1">Notes:</p>
            <p className="text-sm text-gray-700 bg-blue-50 p-2 rounded">
              {offer.notes}
            </p>
          </div>
        )}
        
        <div className="pt-2 border-t text-xs text-gray-500">
          Submitted {formatDate(offer.createdAt)}
        </div>
      </CardContent>
    </Card>
  );
}