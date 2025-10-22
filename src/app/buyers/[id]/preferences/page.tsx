import { Suspense } from "react";
import { BuyerPreferences } from "@/components/buyers/BuyerPreferences";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

interface BuyerPreferencesPageProps {
  params: {
    id: string;
  };
}

export default function BuyerPreferencesPage({ params }: BuyerPreferencesPageProps) {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <Link href={`/buyers/${params.id}`}>
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Buyer Profile
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Buyer Preferences</h1>
        <p className="text-muted-foreground">
          Manage buying criteria and preferences
        </p>
      </div>

      <div className="max-w-2xl">
        <Suspense fallback={<div>Loading preferences...</div>}>
          <BuyerPreferences buyerId={params.id} />
        </Suspense>
      </div>
    </div>
  );
}