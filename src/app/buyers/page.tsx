import { Suspense } from "react";
import BuyerList from "@/components/buyers/BuyerList";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";

export default function BuyersPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Buyer Management</h1>
          <p className="text-muted-foreground">
            Manage your buyer database and preferences
          </p>
        </div>
        <Link href="/buyers/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add New Buyer
          </Button>
        </Link>
      </div>

      <Suspense fallback={<div>Loading buyers...</div>}>
        <BuyerList />
      </Suspense>
    </div>
  );
}