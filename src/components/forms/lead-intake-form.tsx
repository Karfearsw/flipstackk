"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface LeadIntakeFormData {
  ownerName: string;
  ownerPhone: string;
  ownerEmail: string;
  propertyAddress: string;
  city: string;
  state: string;
  zipCode: string;
  propertyType: string;
  condition: string;
  askingPrice: string;
  estimatedValue: string;
  bedrooms: string;
  bathrooms: string;
  squareFeet: string;
  timeline: string;
  motivation: string;
  notes: string;
}

const initialFormData: LeadIntakeFormData = {
  ownerName: "",
  ownerPhone: "",
  ownerEmail: "",
  propertyAddress: "",
  city: "",
  state: "",
  zipCode: "",
  propertyType: "",
  condition: "",
  askingPrice: "",
  estimatedValue: "",
  bedrooms: "",
  bathrooms: "",
  squareFeet: "",
  timeline: "",
  motivation: "",
  notes: "",
};

const propertyTypes = [
  "Single Family",
  "Multi Family",
  "Condo",
  "Townhouse",
  "Mobile Home",
  "Land",
  "Commercial",
];

const propertyConditions = [
  "Excellent",
  "Good",
  "Fair",
  "Poor",
  "Needs Major Repairs",
];

const timelines = [
  "ASAP",
  "Within 30 days",
  "Within 60 days",
  "Within 90 days",
  "No rush",
];

export function LeadIntakeForm() {
  const router = useRouter();
  const [formData, setFormData] = useState<LeadIntakeFormData>(initialFormData);
  const [errors, setErrors] = useState<Partial<LeadIntakeFormData>>({});

  const createLead = trpc.leads.create.useMutation({
    onSuccess: (data) => {
      toast.success("Lead created successfully!");
      router.push(`/leads/${data.id}`);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create lead");
    },
  });

  const handleInputChange = (field: keyof LeadIntakeFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<LeadIntakeFormData> = {};

    // Required fields validation
    if (!formData.ownerName.trim()) newErrors.ownerName = "Owner name is required";
    if (!formData.ownerPhone.trim()) newErrors.ownerPhone = "Owner phone is required";
    if (!formData.propertyAddress.trim()) newErrors.propertyAddress = "Property address is required";
    if (!formData.city.trim()) newErrors.city = "City is required";
    if (!formData.state.trim()) newErrors.state = "State is required";
    if (!formData.zipCode.trim()) newErrors.zipCode = "ZIP code is required";
    if (!formData.propertyType) newErrors.propertyType = "Property type is required";
    if (!formData.condition) newErrors.condition = "Property condition is required";
    if (!formData.askingPrice.trim()) newErrors.askingPrice = "Asking price is required";
    if (!formData.timeline) newErrors.timeline = "Timeline is required";
    if (!formData.motivation.trim()) newErrors.motivation = "Motivation is required";

    // Email validation
    if (formData.ownerEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.ownerEmail)) {
      newErrors.ownerEmail = "Invalid email format";
    }

    // Numeric validations
    if (formData.askingPrice && isNaN(Number(formData.askingPrice))) {
      newErrors.askingPrice = "Must be a valid number";
    }
    if (formData.estimatedValue && isNaN(Number(formData.estimatedValue))) {
      newErrors.estimatedValue = "Must be a valid number";
    }
    if (formData.bedrooms && isNaN(Number(formData.bedrooms))) {
      newErrors.bedrooms = "Must be a valid number";
    }
    if (formData.bathrooms && isNaN(Number(formData.bathrooms))) {
      newErrors.bathrooms = "Must be a valid number";
    }
    if (formData.squareFeet && isNaN(Number(formData.squareFeet))) {
      newErrors.squareFeet = "Must be a valid number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    const submitData = {
      ownerName: formData.ownerName.trim(),
      ownerPhone: formData.ownerPhone.trim(),
      ownerEmail: formData.ownerEmail.trim() || undefined,
      propertyAddress: formData.propertyAddress.trim(),
      city: formData.city.trim(),
      state: formData.state.trim(),
      zipCode: formData.zipCode.trim(),
      propertyType: formData.propertyType,
      condition: formData.condition,
      askingPrice: Number(formData.askingPrice),
      estimatedValue: formData.estimatedValue ? Number(formData.estimatedValue) : undefined,
      bedrooms: formData.bedrooms ? Number(formData.bedrooms) : undefined,
      bathrooms: formData.bathrooms ? Number(formData.bathrooms) : undefined,
      squareFeet: formData.squareFeet ? Number(formData.squareFeet) : undefined,
      timeline: formData.timeline,
      motivation: formData.motivation.trim(),
      notes: formData.notes.trim() || undefined,
    };

    createLead.mutate(submitData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Owner Information */}
      <Card>
        <CardHeader>
          <CardTitle>Owner Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="ownerName">Owner Name *</Label>
              <Input
                id="ownerName"
                value={formData.ownerName}
                onChange={(e) => handleInputChange("ownerName", e.target.value)}
                className={errors.ownerName ? "border-red-500" : ""}
              />
              {errors.ownerName && (
                <p className="text-sm text-red-500 mt-1">{errors.ownerName}</p>
              )}
            </div>
            <div>
              <Label htmlFor="ownerPhone">Phone Number *</Label>
              <Input
                id="ownerPhone"
                type="tel"
                value={formData.ownerPhone}
                onChange={(e) => handleInputChange("ownerPhone", e.target.value)}
                className={errors.ownerPhone ? "border-red-500" : ""}
              />
              {errors.ownerPhone && (
                <p className="text-sm text-red-500 mt-1">{errors.ownerPhone}</p>
              )}
            </div>
          </div>
          <div>
            <Label htmlFor="ownerEmail">Email Address</Label>
            <Input
              id="ownerEmail"
              type="email"
              value={formData.ownerEmail}
              onChange={(e) => handleInputChange("ownerEmail", e.target.value)}
              className={errors.ownerEmail ? "border-red-500" : ""}
            />
            {errors.ownerEmail && (
              <p className="text-sm text-red-500 mt-1">{errors.ownerEmail}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Property Information */}
      <Card>
        <CardHeader>
          <CardTitle>Property Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="propertyAddress">Property Address *</Label>
            <Input
              id="propertyAddress"
              value={formData.propertyAddress}
              onChange={(e) => handleInputChange("propertyAddress", e.target.value)}
              className={errors.propertyAddress ? "border-red-500" : ""}
            />
            {errors.propertyAddress && (
              <p className="text-sm text-red-500 mt-1">{errors.propertyAddress}</p>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="city">City *</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => handleInputChange("city", e.target.value)}
                className={errors.city ? "border-red-500" : ""}
              />
              {errors.city && (
                <p className="text-sm text-red-500 mt-1">{errors.city}</p>
              )}
            </div>
            <div>
              <Label htmlFor="state">State *</Label>
              <Input
                id="state"
                value={formData.state}
                onChange={(e) => handleInputChange("state", e.target.value)}
                className={errors.state ? "border-red-500" : ""}
              />
              {errors.state && (
                <p className="text-sm text-red-500 mt-1">{errors.state}</p>
              )}
            </div>
            <div>
              <Label htmlFor="zipCode">ZIP Code *</Label>
              <Input
                id="zipCode"
                value={formData.zipCode}
                onChange={(e) => handleInputChange("zipCode", e.target.value)}
                className={errors.zipCode ? "border-red-500" : ""}
              />
              {errors.zipCode && (
                <p className="text-sm text-red-500 mt-1">{errors.zipCode}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="propertyType">Property Type *</Label>
              <Select
                value={formData.propertyType}
                onValueChange={(value) => handleInputChange("propertyType", value)}
              >
                <SelectTrigger className={errors.propertyType ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select property type" />
                </SelectTrigger>
                <SelectContent>
                  {propertyTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.propertyType && (
                <p className="text-sm text-red-500 mt-1">{errors.propertyType}</p>
              )}
            </div>
            <div>
              <Label htmlFor="condition">Property Condition *</Label>
              <Select
                value={formData.condition}
                onValueChange={(value) => handleInputChange("condition", value)}
              >
                <SelectTrigger className={errors.condition ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select condition" />
                </SelectTrigger>
                <SelectContent>
                  {propertyConditions.map((condition) => (
                    <SelectItem key={condition} value={condition}>
                      {condition}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.condition && (
                <p className="text-sm text-red-500 mt-1">{errors.condition}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="askingPrice">Asking Price *</Label>
              <Input
                id="askingPrice"
                type="number"
                step="0.01"
                value={formData.askingPrice}
                onChange={(e) => handleInputChange("askingPrice", e.target.value)}
                className={errors.askingPrice ? "border-red-500" : ""}
              />
              {errors.askingPrice && (
                <p className="text-sm text-red-500 mt-1">{errors.askingPrice}</p>
              )}
            </div>
            <div>
              <Label htmlFor="estimatedValue">Estimated Value</Label>
              <Input
                id="estimatedValue"
                type="number"
                step="0.01"
                value={formData.estimatedValue}
                onChange={(e) => handleInputChange("estimatedValue", e.target.value)}
                className={errors.estimatedValue ? "border-red-500" : ""}
              />
              {errors.estimatedValue && (
                <p className="text-sm text-red-500 mt-1">{errors.estimatedValue}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="bedrooms">Bedrooms</Label>
              <Input
                id="bedrooms"
                type="number"
                min="0"
                value={formData.bedrooms}
                onChange={(e) => handleInputChange("bedrooms", e.target.value)}
                className={errors.bedrooms ? "border-red-500" : ""}
              />
              {errors.bedrooms && (
                <p className="text-sm text-red-500 mt-1">{errors.bedrooms}</p>
              )}
            </div>
            <div>
              <Label htmlFor="bathrooms">Bathrooms</Label>
              <Input
                id="bathrooms"
                type="number"
                min="0"
                step="0.5"
                value={formData.bathrooms}
                onChange={(e) => handleInputChange("bathrooms", e.target.value)}
                className={errors.bathrooms ? "border-red-500" : ""}
              />
              {errors.bathrooms && (
                <p className="text-sm text-red-500 mt-1">{errors.bathrooms}</p>
              )}
            </div>
            <div>
              <Label htmlFor="squareFeet">Square Feet</Label>
              <Input
                id="squareFeet"
                type="number"
                min="0"
                value={formData.squareFeet}
                onChange={(e) => handleInputChange("squareFeet", e.target.value)}
                className={errors.squareFeet ? "border-red-500" : ""}
              />
              {errors.squareFeet && (
                <p className="text-sm text-red-500 mt-1">{errors.squareFeet}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lead Details */}
      <Card>
        <CardHeader>
          <CardTitle>Lead Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="timeline">Timeline *</Label>
            <Select
              value={formData.timeline}
              onValueChange={(value) => handleInputChange("timeline", value)}
            >
              <SelectTrigger className={errors.timeline ? "border-red-500" : ""}>
                <SelectValue placeholder="Select timeline" />
              </SelectTrigger>
              <SelectContent>
                {timelines.map((timeline) => (
                  <SelectItem key={timeline} value={timeline}>
                    {timeline}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.timeline && (
              <p className="text-sm text-red-500 mt-1">{errors.timeline}</p>
            )}
          </div>

          <div>
            <Label htmlFor="motivation">Motivation for Selling *</Label>
            <Textarea
              id="motivation"
              value={formData.motivation}
              onChange={(e) => handleInputChange("motivation", e.target.value)}
              className={errors.motivation ? "border-red-500" : ""}
              rows={3}
            />
            {errors.motivation && (
              <p className="text-sm text-red-500 mt-1">{errors.motivation}</p>
            )}
          </div>

          <div>
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange("notes", e.target.value)}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end space-x-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={createLead.isLoading}
        >
          {createLead.isLoading && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          Create Lead
        </Button>
      </div>
    </form>
  );
}