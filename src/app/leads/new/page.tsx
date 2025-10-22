"use client";

import { LeadIntakeForm } from "@/components/forms/lead-intake-form";

export default function NewLeadPage() {
  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Create New Lead</h1>
        <p className="text-gray-600">
          Enter the property owner and property information to create a new lead
        </p>
      </div>
      
      <LeadIntakeForm />
    </div>
  );
}