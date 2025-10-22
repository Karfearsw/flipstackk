"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { X, Plus } from "lucide-react";
import { toast } from "sonner";

interface BuyerFormProps {
  buyerId?: string;
  initialData?: any;
}

export function BuyerForm({ buyerId, initialData }: BuyerFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    email: initialData?.email || "",
    phone: initialData?.phone || "",
    company: initialData?.company || "",
    proofOfFunds: initialData?.proofOfFunds || "",
    cashBuyer: initialData?.cashBuyer || false,
    notes: initialData?.notes || "",
    // Preferences
    minPrice: initialData?.preferences?.[0]?.minPrice || "",
    maxPrice: initialData?.preferences?.[0]?.maxPrice || "",
    areas: initialData?.preferences?.[0]?.areas || [],
    propertyTypes: initialData?.preferences?.[0]?.propertyTypes || [],
  });

  const [newArea, setNewArea] = useState("");
  const [newPropertyType, setNewPropertyType] = useState("");

  const createBuyer = trpc.buyers.create.useMutation({
    onSuccess: () => {
      toast.success("Buyer created successfully!");
      router.push("/buyers");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create buyer");
    },
  });

  const updateBuyer = trpc.buyers.update.useMutation({
    onSuccess: () => {
      toast.success("Buyer updated successfully!");
      router.push(`/buyers/${buyerId}`);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update buyer");
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const buyerData = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      company: formData.company || undefined,
      proofOfFunds: Number(formData.proofOfFunds),
      cashBuyer: formData.cashBuyer,
      notes: formData.notes || undefined,
    };

    const preferences = formData.minPrice && formData.maxPrice ? {
      minPrice: Number(formData.minPrice),
      maxPrice: Number(formData.maxPrice),
      areas: formData.areas,
      propertyTypes: formData.propertyTypes,
    } : undefined;

    try {
      if (buyerId) {
        await updateBuyer.mutateAsync({ id: buyerId, ...buyerData });
      } else {
        await createBuyer.mutateAsync({ ...buyerData, preferences });
      }
    } catch (error: unknown) {
      // Error handling is done in the mutation callbacks
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

  const isLoading = createBuyer.isLoading || updateBuyer.isLoading;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone *</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company">Company</Label>
              <Input
                id="company"
                value={formData.company}
                onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="proofOfFunds">Proof of Funds *</Label>
              <Input
                id="proofOfFunds"
                type="number"
                min="0"
                step="0.01"
                value={formData.proofOfFunds}
                onChange={(e) => setFormData(prev => ({ ...prev, proofOfFunds: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Buyer Type</Label>
              <div className="flex items-center space-x-2 pt-2">
                <Checkbox
                  id="cashBuyer"
                  checked={formData.cashBuyer}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ ...prev, cashBuyer: checked as boolean }))
                  }
                />
                <Label htmlFor="cashBuyer">Cash Buyer</Label>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Buying Preferences */}
      <Card>
        <CardHeader>
          <CardTitle>Buying Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="minPrice">Minimum Price</Label>
              <Input
                id="minPrice"
                type="number"
                min="0"
                step="0.01"
                value={formData.minPrice}
                onChange={(e) => setFormData(prev => ({ ...prev, minPrice: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxPrice">Maximum Price</Label>
              <Input
                id="maxPrice"
                type="number"
                min="0"
                step="0.01"
                value={formData.maxPrice}
                onChange={(e) => setFormData(prev => ({ ...prev, maxPrice: e.target.value }))}
              />
            </div>
          </div>

          <Separator />

          {/* Preferred Areas */}
          <div className="space-y-2">
            <Label>Preferred Areas</Label>
            <div className="flex space-x-2">
              <Input
                value={newArea}
                onChange={(e) => setNewArea(e.target.value)}
                placeholder="Add area (city, zip code, etc.)"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addArea())}
              />
              <Button type="button" onClick={addArea} variant="outline">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.areas.map((area) => (
                <Badge key={area} variant="secondary" className="flex items-center gap-1">
                  {area}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => removeArea(area)}
                  />
                </Badge>
              ))}
            </div>
          </div>

          {/* Property Types */}
          <div className="space-y-2">
            <Label>Property Types</Label>
            <div className="flex space-x-2">
              <Input
                value={newPropertyType}
                onChange={(e) => setNewPropertyType(e.target.value)}
                placeholder="Add property type (SFH, Condo, etc.)"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addPropertyType())}
              />
              <Button type="button" onClick={addPropertyType} variant="outline">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.propertyTypes.map((type) => (
                <Badge key={type} variant="secondary" className="flex items-center gap-1">
                  {type}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => removePropertyType(type)}
                  />
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Submit Button */}
      <div className="flex justify-end space-x-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Saving..." : buyerId ? "Update Buyer" : "Create Buyer"}
        </Button>
      </div>
    </form>
  );
}