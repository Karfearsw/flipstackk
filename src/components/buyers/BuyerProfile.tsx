"use client";

import { trpc } from "@/lib/trpc-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Edit, 
  Settings, 
  DollarSign, 
  Building, 
  Phone, 
  Mail,
  Calendar,
  FileText,
  TrendingUp,
  CheckSquare
} from "lucide-react";
import Link from "next/link";
import { formatCurrency, formatDate } from "@/lib/utils";

interface BuyerProfileProps {
  buyerId: string;
}

export function BuyerProfile({ buyerId }: BuyerProfileProps) {
  const { data: buyer, isLoading } = trpc.buyers.getById.useQuery({ id: buyerId });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-32 bg-gray-200 rounded animate-pulse" />
        <div className="h-64 bg-gray-200 rounded animate-pulse" />
      </div>
    );
  }

  if (!buyer) {
    return (
      <div className="text-center py-8">
        <h2 className="text-2xl font-bold text-gray-900">Buyer not found</h2>
        <p className="text-gray-600 mt-2">The buyer you&apos;re looking for doesn&apos;t exist.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl">{buyer.name}</CardTitle>
              <div className="flex items-center space-x-4 mt-2 text-sm text-muted-foreground">
                <div className="flex items-center">
                  <Mail className="h-4 w-4 mr-1" />
                  {buyer.email}
                </div>
                <div className="flex items-center">
                  <Phone className="h-4 w-4 mr-1" />
                  {buyer.phone}
                </div>
                {buyer.company && (
                  <div className="flex items-center">
                    <Building className="h-4 w-4 mr-1" />
                    {buyer.company}
                  </div>
                )}
              </div>
            </div>
            <div className="flex space-x-2">
              <Link href={`/tasks/new?buyerId=${buyerId}`}>
                <Button variant="default" size="sm">
                  <CheckSquare className="h-4 w-4 mr-2" />
                  Create Task
                </Button>
              </Link>
              <Link href={`/buyers/${buyerId}/preferences`}>
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4 mr-2" />
                  Preferences
                </Button>
              </Link>
              <Link href={`/buyers/${buyerId}/edit`}>
                <Button size="sm">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              </Link>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Proof of Funds</p>
                <p className="font-semibold">{formatCurrency(Number(buyer.proofOfFunds))}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Buyer Type</p>
                <Badge variant={buyer.cashBuyer ? "default" : "secondary"}>
                  {buyer.cashBuyer ? "Cash Buyer" : "Financed"}
                </Badge>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-muted-foreground">Total Offers</p>
                <p className="font-semibold">{buyer.offers.length}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm text-muted-foreground">Added</p>
                <p className="font-semibold">{formatDate(buyer.createdAt)}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
          <TabsTrigger value="offers">Offers ({buyer.offers.length})</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Info */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{buyer.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium">{buyer.phone}</p>
                </div>
                {buyer.company && (
                  <div>
                    <p className="text-sm text-muted-foreground">Company</p>
                    <p className="font-medium">{buyer.company}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Financial Info */}
            <Card>
              <CardHeader>
                <CardTitle>Financial Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Proof of Funds</p>
                  <p className="font-medium">{formatCurrency(Number(buyer.proofOfFunds))}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Buyer Type</p>
                  <Badge variant={buyer.cashBuyer ? "default" : "secondary"}>
                    {buyer.cashBuyer ? "Cash Buyer" : "Financed"}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Notes */}
          {buyer.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap">{buyer.notes}</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="preferences" className="space-y-4">
          {buyer.preferences.length > 0 ? (
            buyer.preferences.map((pref) => (
              <Card key={pref.id}>
                <CardHeader>
                  <CardTitle>Buying Preferences</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Price Range</p>
                      <p className="font-medium">
                        {formatCurrency(Number(pref.minPrice))} - {formatCurrency(Number(pref.maxPrice))}
                      </p>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Preferred Areas</p>
                    <div className="flex flex-wrap gap-2">
                      {(pref.areas as string[]).map((area) => (
                        <Badge key={area} variant="outline">{area}</Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Property Types</p>
                    <div className="flex flex-wrap gap-2">
                      {(pref.propertyTypes as string[]).map((type) => (
                        <Badge key={type} variant="outline">{type}</Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-muted-foreground">No preferences set</p>
                <Link href={`/buyers/${buyerId}/preferences`}>
                  <Button className="mt-4">
                    <Settings className="h-4 w-4 mr-2" />
                    Set Preferences
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="offers" className="space-y-4">
          {buyer.offers.length > 0 ? (
            <div className="space-y-4">
              {buyer.offers.map((offer) => (
                <Card key={offer.id}>
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold">
                          {offer.lead.property.address}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {offer.lead.property.city}, {offer.lead.property.state}
                        </p>
                        <p className="font-medium mt-2">
                          Offer: {formatCurrency(Number(offer.offerAmount))}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge 
                          variant={
                            offer.status === 'ACCEPTED' ? 'default' :
                            offer.status === 'REJECTED' ? 'destructive' :
                            offer.status === 'SENT' ? 'secondary' : 'outline'
                          }
                        >
                          {offer.status}
                        </Badge>
                        <p className="text-sm text-muted-foreground mt-1">
                          {formatDate(offer.createdAt)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-muted-foreground">No offers yet</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground">Activity tracking coming soon</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}