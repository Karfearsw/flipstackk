import { BuyerForm } from "@/components/buyers/BuyerForm";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NewBuyerPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <Link href="/buyers">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Buyers
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Add New Buyer</h1>
        <p className="text-muted-foreground">
          Create a new buyer profile with preferences
        </p>
      </div>

      <div className="max-w-2xl">
        <BuyerForm />
      </div>
    </div>
  );
}