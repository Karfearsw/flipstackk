import { Suspense } from "react";
import { BuyerProfile } from "@/components/buyers/BuyerProfile";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

interface BuyerDetailPageProps {
  params: {
    id: string;
  };
}

export default function BuyerDetailPage({ params }: BuyerDetailPageProps) {
  return (
    <MainLayout 
      navigationTitle="Buyer Details"
      customBackPath="/buyers"
      breadcrumbs={[
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Buyers', href: '/buyers' },
        { label: 'Buyer Details' }
      ]}
    >
      <Suspense fallback={<div>Loading buyer details...</div>}>
        <BuyerProfile buyerId={params.id} />
      </Suspense>
    </MainLayout>
  );
}