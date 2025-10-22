'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Phone, Mail, MapPin, Eye } from 'lucide-react';
import { trpc } from '@/lib/trpc-client';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface Lead {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string | null;
  status: string;
  timeline: string;
  motivation: string;
  address: string;
  city: string;
  state: string;
  estimatedValue: number | null;
  propertyType: string;
}

interface PipelineBoardProps {
  leads: Lead[];
  onLeadUpdate: () => void;
}

const statusColumns = [
  { key: 'NEW', label: 'New Leads', color: 'bg-red-50 border-red-200' },
  { key: 'CONTACTED', label: 'Contacted', color: 'bg-gray-50 border-gray-200' },
  { key: 'QUALIFIED', label: 'Qualified', color: 'bg-black border-black' },
  { key: 'PROPOSAL_SENT', label: 'Proposal Sent', color: 'bg-gray-800 border-gray-800' },
  { key: 'NEGOTIATING', label: 'Negotiating', color: 'bg-gray-600 border-gray-600' },
  { key: 'CLOSED_WON', label: 'Closed Won', color: 'bg-gray-900 border-gray-900' },
  { key: 'CLOSED_LOST', label: 'Closed Lost', color: 'bg-red-100 border-red-300' },
];

export function PipelineBoard({ leads, onLeadUpdate }: PipelineBoardProps) {
  const router = useRouter();
  const [draggedLead, setDraggedLead] = useState<Lead | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);

  const updateLeadMutation = trpc.leads.update.useMutation({
    onSuccess: () => {
      toast.success('Lead status updated successfully');
      onLeadUpdate();
    },
    onError: (error) => {
      toast.error(`Failed to update lead: ${error.message}`);
    },
  });

  const handleDragStart = (e: React.DragEvent, lead: Lead) => {
    setDraggedLead(lead);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, status: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverColumn(status);
  };

  const handleDragLeave = () => {
    setDragOverColumn(null);
  };

  const handleDrop = (e: React.DragEvent, newStatus: string) => {
    e.preventDefault();
    setDragOverColumn(null);

    if (draggedLead && draggedLead.status !== newStatus) {
      updateLeadMutation.mutate({
        id: draggedLead.id,
        status: newStatus as 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'PROPOSAL_SENT' | 'NEGOTIATING' | 'CLOSED_WON' | 'CLOSED_LOST',
      });
    }

    setDraggedLead(null);
  };



  const getLeadsByStatus = (status: string) => {
    return leads.filter(lead => lead.status === status);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="overflow-x-auto">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 min-w-[800px] lg:min-w-0">
        {statusColumns.map((column) => {
          const columnLeads = getLeadsByStatus(column.key);
          const isDragOver = dragOverColumn === column.key;

          return (
            <div
              key={column.key}
              className={`${column.color} rounded-lg p-3 lg:p-4 min-h-[400px] lg:min-h-[600px] ${
                isDragOver ? 'ring-2 ring-blue-400 bg-blue-100' : ''
              }`}
              onDragOver={(e) => handleDragOver(e, column.key)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, column.key)}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-xs lg:text-sm text-gray-700">
                  {column.label}
                </h3>
                <span className="bg-gray-200 text-gray-600 text-xs px-2 py-1 rounded-full">
                  {columnLeads.length}
                </span>
              </div>
              <div className="space-y-3 overflow-y-auto max-h-[350px] lg:max-h-[500px]">
              {columnLeads.map((lead) => (
                <Card
                  key={lead.id}
                  className="cursor-move hover:shadow-md transition-shadow bg-white"
                  draggable
                  onDragStart={(e) => handleDragStart(e, lead)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-sm font-medium">
                          {lead.firstName} {lead.lastName}
                        </CardTitle>
                        <p className="text-xs text-gray-600 mt-1">
                          {lead.address}
                        </p>
                        <p className="text-xs text-gray-500">
                          {lead.city}, {lead.state}
                        </p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {lead.propertyType}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-0">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-green-600">
                          {lead.estimatedValue ? formatPrice(lead.estimatedValue) : 'N/A'}
                        </span>
                      </div>

                      <div className="text-xs text-gray-600">
                        <p><strong>Timeline:</strong> {lead.timeline}</p>
                        <p><strong>Motivation:</strong> {lead.motivation}</p>
                      </div>

                      <div className="flex items-center gap-1 pt-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 w-7 p-0"
                          onClick={() => router.push(`/leads/${lead.id}`)}
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 w-7 p-0"
                          onClick={() => window.open(`tel:${lead.phone}`)}
                        >
                          <Phone className="h-3 w-3" />
                        </Button>
                        {lead.email && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 w-7 p-0"
                            onClick={() => window.open(`mailto:${lead.email}`)}
                          >
                            <Mail className="h-3 w-3" />
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 w-7 p-0"
                          onClick={() => 
                            window.open(
                              `https://maps.google.com/?q=${encodeURIComponent(
                                `${lead.address}, ${lead.city}, ${lead.state}`
                              )}`
                            )
                          }
                        >
                          <MapPin className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {columnLeads.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <p className="text-sm">No leads in this stage</p>
                  <p className="text-xs mt-1">Drag leads here to update status</p>
                </div>
              )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}