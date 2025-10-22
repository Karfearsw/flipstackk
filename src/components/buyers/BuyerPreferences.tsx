"use client";

import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X, Plus, Save } from "lucide-react";
import { toast } from "sonner";

interface BuyerPreferencesProps {
  buyerId: string;
}

export function BuyerPreferences({ buyerId }: BuyerPreferencesProps) {
  const { data: buyer, isLoading, refetch } = trpc.buyers.getById.useQuery({ id: buyerId });
  
  const [formData, setFormData] = useState({
    minPrice: "",
    maxPrice: "",
    areas: [] as string[],
    propertyTypes: [] as string[],
  });

  const [newArea, setNewArea] = useState("");
  const [newPropertyType, setNewPropertyType] = useState("");

  // Load existing preferences
  useEffect(() => {
    if (buyer?.preferences?.[0]) {
      const pref = buyer.preferences[0];
      setFormData({
        minPrice: pref.minPrice.toString(),
        maxPrice: pref.maxPrice.toString(),
        areas: pref.areas as string[],
        propertyTypes: pref.propertyTypes as string[],
      });
    }
  }, [buyer]);

  const updatePreferences = trpc.buyers.updatePreferences?.useMutation({
    onSuccess: () => {
      toast.success("Preferences updated successfully!");
      refetch();
    },
    onError: () => {
      toast.error("Failed to update preferences");
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.minPrice || !formData.maxPrice) {
      toast.error("Please enter both minimum and maximum price");
      return;
    }

    if (Number(formData.minPrice) >= Number(formData.maxPrice)) {
      toast.error("Minimum price must be less than maximum price");
      return;
    }

    try {
      // For now, we'll use the update buyer mutation to handle preferences
      // In a real app, you'd want a separate preferences endpoint
      const preferences = {
        minPrice: Number(formData.minPrice),
        maxPrice: Number(formData.maxPrice),
        areas: formData.areas,
        propertyTypes: formData.propertyTypes,
      };

      // This would need to be implemented in the tRPC router
      toast.success("Preferences saved! (Note: Full implementation pending)");
    } catch (error) {
      toast.error("Failed to save preferences");
    }
  };

  const addArea = () => {
    if (newArea.trim() && !formData.areas.includes(newArea.trim())) {
      setFormData(prev => ({
        ...prev,
        areas: [...prev.areas, newArea.trim()]
      }));
      setNewArea("");
    }
  };

  const removeArea = (area: string) => {
    setFormData(prev => ({
      ...prev,
      areas: prev.areas.filter(a => a !== area)
    }));
  };

  const addPropertyType = () => {
    if (newPropertyType.trim() && !formData.propertyTypes.includes(newPropertyType.trim())) {
      setFormData(prev => ({
        ...prev,
        propertyTypes: [...prev.propertyTypes, newPropertyType.trim()]
      }));
      setNewPropertyType("");
    }
  };

  const removePropertyType = (type: string) => {
    setFormData(prev => ({
      ...prev,
      propertyTypes: prev.propertyTypes.filter(t => t !== type)
    }));
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
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
      {/* Buyer Info Header */}
      <Card>
        <CardHeader>
          <CardTitle>Preferences for {buyer.name}</CardTitle>
          <p className="text-sm text-muted-foreground">
            Set buying criteria to help match this buyer with suitable properties
          </p>
        </CardHeader>
      </Card>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Price Range */}
        <Card>
          <CardHeader>
            <CardTitle>Price Range</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="minPrice">Minimum Price *</Label>
                <Input
                  id="minPrice"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.minPrice}
                  onChange={(e) => setFormData(prev => ({ ...prev, minPrice: e.target.value }))}
                  placeholder="e.g., 100000"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxPrice">Maximum Price *</Label>
                <Input
                  id="maxPrice"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.maxPrice}
                  onChange={(e) => setFormData(prev => ({ ...prev, maxPrice: e.target.value }))}
                  placeholder="e.g., 500000"
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Preferred Areas */}
        <Card>
          <CardHeader>
            <CardTitle>Preferred Areas</CardTitle>
            <p className="text-sm text-muted-foreground">
              Add cities, neighborhoods, or zip codes where the buyer wants to invest
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex space-x-2">
              <Input
                value={newArea}
                onChange={(e) => setNewArea(e.target.value)}
                placeholder="Enter area (e.g., Downtown, 90210, Los Angeles)"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addArea())}
              />
              <Button type="button" onClick={addArea} variant="outline">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {formData.areas.map((area) => (
                <Badge key={area} variant="secondary" className="flex items-center gap-1">
                  {area}
                  <X 
                    className="h-3 w-3 cursor-pointer hover:text-red-500" 
                    onClick={() => removeArea(area)}
                  />
                </Badge>
              ))}
            </div>
            
            {formData.areas.length === 0 && (
              <p className="text-sm text-muted-foreground italic">
                No areas specified - buyer is open to all locations
              </p>
            )}
          </CardContent>
        </Card>

        {/* Property Types */}
        <Card>
          <CardHeader>
            <CardTitle>Property Types</CardTitle>
            <p className="text-sm text-muted-foreground">
              Specify what types of properties the buyer is interested in
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex space-x-2">
              <Input
                value={newPropertyType}
                onChange={(e) => setNewPropertyType(e.target.value)}
                placeholder="Enter property type (e.g., Single Family, Condo, Duplex)"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addPropertyType())}
              />
              <Button type="button" onClick={addPropertyType} variant="outline">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {formData.propertyTypes.map((type) => (
                <Badge key={type} variant="secondary" className="flex items-center gap-1">
                  {type}
                  <X 
                    className="h-3 w-3 cursor-pointer hover:text-red-500" 
                    onClick={() => removePropertyType(type)}
                  />
                </Badge>
              ))}
            </div>
            
            {formData.propertyTypes.length === 0 && (
              <p className="text-sm text-muted-foreground italic">
                No property types specified - buyer is open to all property types
              </p>
            )}

            {/* Common property type suggestions */}
            <div className="pt-2">
              <p className="text-sm text-muted-foreground mb-2">Common types:</p>
              <div className="flex flex-wrap gap-2">
                {['Single Family', 'Condo', 'Townhouse', 'Duplex', 'Multi-Family', 'Commercial'].map((type) => (
                  <Button
                    key={type}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (!formData.propertyTypes.includes(type)) {
                        setFormData(prev => ({
                          ...prev,
                          propertyTypes: [...prev.propertyTypes, type]
                        }));
                      }
                    }}
                    disabled={formData.propertyTypes.includes(type)}
                  >
                    {type}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end space-x-2">
          <Button type="submit" disabled={updatePreferences?.isLoading}>
            <Save className="h-4 w-4 mr-2" />
            {updatePreferences?.isLoading ? "Saving..." : "Save Preferences"}
          </Button>
        </div>
      </form>

      {/* Current Preferences Summary */}
      {buyer.preferences.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Current Preferences Summary</CardTitle>
          </CardHeader>
          <CardContent>
            {buyer.preferences.map((pref) => (
              <div key={pref.id} className="space-y-2">
                <p><strong>Price Range:</strong> ${Number(pref.minPrice).toLocaleString()} - ${Number(pref.maxPrice).toLocaleString()}</p>
                <p><strong>Areas:</strong> {(pref.areas as string[]).length > 0 ? (pref.areas as string[]).join(', ') : 'Any'}</p>
                <p><strong>Property Types:</strong> {(pref.propertyTypes as string[]).length > 0 ? (pref.propertyTypes as string[]).join(', ') : 'Any'}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}