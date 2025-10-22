'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, Mail, Phone, DollarSign, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { trpc } from '@/lib/trpc-client';
import { formatCurrency } from '@/lib/utils';

interface BuyerMatchesProps {
  leadId: string;
  propertyPrice?: number;
  propertyType?: string;
  propertyCity?: string;
  propertyState?: string;
}

interface BuyerMatch {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  proofOfFunds?: number;
  cashBuyer: boolean;
  matchScore: number;
  matchReasons: string[];
  preferences?: {
    minPrice?: number;
    maxPrice?: number;
    areas: string[];
    propertyTypes: string[];
  }[];
}

export default function BuyerMatches({ 
 
  propertyPrice, 
  propertyType, 
  propertyCity, 
  propertyState 
}: BuyerMatchesProps) {
  const router = useRouter();
  const [showAll, setShowAll] = useState(false);

  const { data: buyers, isLoading } = trpc.buyers.getAll.useQuery();

  // Calculate buyer matches based on property details
  const calculateMatches = (): BuyerMatch[] => {
    if (!buyers) return [];

    return buyers
      .map(buyer => {
        let matchScore = 0;
        const matchReasons: string[] = [];

        // Check if buyer has preferences
        const preferences = buyer.preferences?.[0]; // Assuming one preference set per buyer
        
        if (!preferences) {
          return {
            ...buyer,
            matchScore: 10, // Base score for buyers without specific preferences
            matchReasons: ['General investor'],
          };
        }

        // Price range matching (40% of score)
        if (propertyPrice) {
          const minPrice = preferences.minPrice || 0;
          const maxPrice = preferences.maxPrice || Infinity;
          
          if (propertyPrice >= minPrice && propertyPrice <= maxPrice) {
            matchScore += 40;
            matchReasons.push(`Price range match ($${minPrice.toLocaleString()} - $${maxPrice.toLocaleString()})`);
          } else if (propertyPrice < minPrice) {
            const diff = ((propertyPrice / minPrice) * 40);
            matchScore += Math.max(0, diff);
            matchReasons.push(`Below preferred price range`);
          } else {
            const diff = ((maxPrice / propertyPrice) * 40);
            matchScore += Math.max(0, diff);
            matchReasons.push(`Above preferred price range`);
          }
        }

        // Location matching (30% of score)
        if (propertyCity && preferences.areas.length > 0) {
          const cityMatch = preferences.areas.some(area => 
            area.toLowerCase().includes(propertyCity.toLowerCase()) ||
            propertyCity.toLowerCase().includes(area.toLowerCase())
          );
          
          if (cityMatch) {
            matchScore += 30;
            matchReasons.push(`Location match (${propertyCity})`);
          } else {
            // Check if state matches any area (partial match)
            const stateMatch = propertyState && preferences.areas.some(area =>
              area.toLowerCase().includes(propertyState.toLowerCase())
            );
            if (stateMatch) {
              matchScore += 15;
              matchReasons.push(`State match (${propertyState})`);
            }
          }
        }

        // Property type matching (20% of score)
        if (propertyType && preferences.propertyTypes.length > 0) {
          const typeMatch = preferences.propertyTypes.some(type =>
            type.toLowerCase() === propertyType.toLowerCase()
          );
          
          if (typeMatch) {
            matchScore += 20;
            matchReasons.push(`Property type match (${propertyType})`);
          }
        }

        // Cash buyer bonus (10% of score)
        if (buyer.cashBuyer) {
          matchScore += 10;
          matchReasons.push('Cash buyer');
        }

        // Proof of funds consideration
        if (buyer.proofOfFunds && propertyPrice) {
          if (buyer.proofOfFunds >= propertyPrice) {
            matchReasons.push('Sufficient funds');
          } else {
            matchReasons.push('May need financing');
          }
        }

        return {
          ...buyer,
          matchScore: Math.round(matchScore),
          matchReasons,
        };
      })
      .sort((a, b) => b.matchScore - a.matchScore);
  };

  const matches = calculateMatches();
  const topMatches = showAll ? matches : matches.slice(0, 3);

  const getMatchScoreColor = (score: number) => {
    if (score >= 80) return 'bg-black text-white';
    if (score >= 60) return 'bg-gray-800 text-white';
    if (score >= 40) return 'bg-red-100 text-red-800';
    return 'bg-red-500 text-white';
  };

  const getMatchScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent Match';
    if (score >= 60) return 'Good Match';
    if (score >= 40) return 'Fair Match';
    return 'Poor Match';
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="mr-2 h-5 w-5" />
            Potential Buyer Matches
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse">
                <div className="flex items-center space-x-4">
                  <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <Users className="mr-2 h-5 w-5" />
            Potential Buyer Matches
          </div>
          <Badge variant="outline">
            {matches.length} {matches.length === 1 ? 'match' : 'matches'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {matches.length === 0 ? (
          <div className="text-center py-8">
            <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500">No buyer matches found</p>
            <p className="text-sm text-gray-400 mt-1">
              Add buyers with preferences to see potential matches
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {topMatches.map((buyer) => (
              <div
                key={buyer.id}
                className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarFallback>
                        {buyer.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-medium">{buyer.name}</h4>
                      {buyer.company && (
                        <p className="text-sm text-gray-600">{buyer.company}</p>
                      )}
                    </div>
                  </div>
                  <Badge className={getMatchScoreColor(buyer.matchScore)}>
                    {buyer.matchScore}% {getMatchScoreLabel(buyer.matchScore)}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                  {buyer.email && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Mail className="h-4 w-4 mr-2" />
                      {buyer.email}
                    </div>
                  )}
                  {buyer.phone && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Phone className="h-4 w-4 mr-2" />
                      {buyer.phone}
                    </div>
                  )}
                  {buyer.proofOfFunds && (
                    <div className="flex items-center text-sm text-gray-600">
                      <DollarSign className="h-4 w-4 mr-2" />
                      {formatCurrency(buyer.proofOfFunds)} proof of funds
                    </div>
                  )}
                  <div className="flex items-center text-sm">
                    <Badge variant={buyer.cashBuyer ? 'default' : 'secondary'} className="text-xs">
                      {buyer.cashBuyer ? 'Cash Buyer' : 'Financed'}
                    </Badge>
                  </div>
                </div>

                <div className="mb-3">
                  <p className="text-sm font-medium text-gray-700 mb-1">Match Reasons:</p>
                  <div className="flex flex-wrap gap-1">
                    {buyer.matchReasons.map((reason, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {reason}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => router.push(`/buyers/${buyer.id}`)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View Profile
                  </Button>
                  {buyer.email && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(`mailto:${buyer.email}?subject=Property Opportunity - ${propertyCity}&body=Hi ${buyer.name},%0D%0A%0D%0AI have a property that matches your investment criteria...`)}
                    >
                      <Mail className="h-4 w-4 mr-1" />
                      Email
                    </Button>
                  )}
                  {buyer.phone && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(`tel:${buyer.phone}`)}
                    >
                      <Phone className="h-4 w-4 mr-1" />
                      Call
                    </Button>
                  )}
                </div>
              </div>
            ))}

            {matches.length > 3 && (
              <div className="text-center pt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowAll(!showAll)}
                >
                  {showAll ? 'Show Less' : `Show All ${matches.length} Matches`}
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}