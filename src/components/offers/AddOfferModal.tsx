"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Calendar, DollarSign, Home, User } from "lucide-react";

interface AddOfferModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddOfferModal({ open, onOpenChange }: AddOfferModalProps) {
  const [formData, setFormData] = useState({
    buyerName: "",
    buyerEmail: "",
    buyerPhone: "",
    propertyId: "",
    offerAmount: "",
    earnestMoney: "",
    closingDate: "",
    contingencies: "",
    notes: "",
    financingType: "CASH"
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const offerData = {
      ...formData,
      offerAmount: parseFloat(formData.offerAmount) || 0,
      earnestMoney: parseFloat(formData.earnestMoney) || 0,
      status: "PENDING",
      createdAt: new Date().toISOString(),
    };
    
    console.log('Offer submitted:', offerData);
    
    // Reset form
    setFormData({
      buyerName: "",
      buyerEmail: "",
      buyerPhone: "",
      propertyId: "",
      offerAmount: "",
      earnestMoney: "",
      closingDate: "",
      contingencies: "",
      notes: "",
      financingType: "CASH"
    });
    
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-black">
            <DollarSign className="h-5 w-5 text-red-500" />
            Create New Offer
          </DialogTitle>
          <DialogDescription className="text-black">
            Submit a new offer for a property. Fill in all required details.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Buyer Information */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-black">
              <User className="h-4 w-4 text-red-500" />
              Buyer Information
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="buyerName" className="text-black">Buyer Name *</Label>
                <Input
                  id="buyerName"
                  value={formData.buyerName}
                  onChange={(e) => handleInputChange("buyerName", e.target.value)}
                  placeholder="Enter buyer's full name"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="buyerEmail" className="text-black">Email</Label>
                <Input
                  id="buyerEmail"
                  type="email"
                  value={formData.buyerEmail}
                  onChange={(e) => handleInputChange("buyerEmail", e.target.value)}
                  placeholder="buyer@example.com"
                />
              </div>
              
              <div>
                <Label htmlFor="buyerPhone" className="text-black">Phone</Label>
                <Input
                  id="buyerPhone"
                  value={formData.buyerPhone}
                  onChange={(e) => handleInputChange("buyerPhone", e.target.value)}
                  placeholder="(555) 123-4567"
                />
              </div>
            </div>
          </div>

          {/* Property & Offer Details */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-black">
              <Home className="h-4 w-4 text-red-500" />
              Property &amp; Offer Details
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="propertyId" className="text-black">Property *</Label>
                <Select value={formData.propertyId} onValueChange={(value) => handleInputChange("propertyId", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a property" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">123 Main St - $450,000</SelectItem>
                    <SelectItem value="2">456 Oak Ave - $325,000</SelectItem>
                    <SelectItem value="3">789 Pine Rd - $275,000</SelectItem>
                    <SelectItem value="4">321 Elm St - $520,000</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="financingType" className="text-black">Financing Type</Label>
                <Select value={formData.financingType} onValueChange={(value) => handleInputChange("financingType", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CASH">Cash</SelectItem>
                    <SelectItem value="CONVENTIONAL">Conventional Loan</SelectItem>
                    <SelectItem value="FHA">FHA Loan</SelectItem>
                    <SelectItem value="VA">VA Loan</SelectItem>
                    <SelectItem value="OTHER">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="offerAmount" className="text-black">Offer Amount *</Label>
                <Input
                  id="offerAmount"
                  type="number"
                  value={formData.offerAmount}
                  onChange={(e) => handleInputChange("offerAmount", e.target.value)}
                  placeholder="450000"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="earnestMoney" className="text-black">Earnest Money</Label>
                <Input
                  id="earnestMoney"
                  type="number"
                  value={formData.earnestMoney}
                  onChange={(e) => handleInputChange("earnestMoney", e.target.value)}
                  placeholder="5000"
                />
              </div>
            </div>
          </div>

          {/* Timeline & Additional Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-black">
              <Calendar className="h-4 w-4 text-red-500" />
              Timeline &amp; Additional Information
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="closingDate" className="text-black">Preferred Closing Date</Label>
                <Input
                  id="closingDate"
                  type="date"
                  value={formData.closingDate}
                  onChange={(e) => handleInputChange("closingDate", e.target.value)}
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="contingencies" className="text-black">Contingencies</Label>
              <Textarea
                id="contingencies"
                value={formData.contingencies}
                onChange={(e) => handleInputChange("contingencies", e.target.value)}
                placeholder="List any contingencies (inspection, financing, appraisal, etc.)"
                rows={3}
              />
            </div>
            
            <div>
              <Label htmlFor="notes" className="text-black">Additional Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleInputChange("notes", e.target.value)}
                placeholder="Any additional information or special terms"
                rows={3}
              />
            </div>
          </div>
        </form>
        
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" onClick={handleSubmit} className="bg-red-500 hover:bg-red-600 text-white">
            Submit Offer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}