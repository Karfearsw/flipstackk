"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MainLayout } from "@/components/layout/MainLayout";
import { 
  ArrowLeft, 
  Edit, 
  Phone, 
  Mail, 
  MapPin, 
  Home, 
  DollarSign, 
  Calendar,
  MessageSquare,
  Plus,
  Trash2,
  CheckSquare
} from "lucide-react";
import { LeadStatus } from "@prisma/client";
import { toast } from "sonner";
import BuyerMatches from "@/components/leads/BuyerMatches";

const formatPrice = (price: number | null | undefined) => {
  if (!price) return 'N/A';
  return `$${price.toLocaleString()}`;
};

const statusColors = {
  NEW: "bg-red-100 text-red-800",
  CONTACTED: "bg-gray-100 text-gray-800",
  QUALIFIED: "bg-black text-white",
  UNDER_CONTRACT: "bg-gray-800 text-white",
  CLOSED: "bg-gray-600 text-white",
  LOST: "bg-red-500 text-white",
};

const statusLabels = {
  NEW: "New",
  CONTACTED: "Contacted",
  QUALIFIED: "Qualified",
  UNDER_CONTRACT: "Under Contract",
  CLOSED: "Closed",
  LOST: "Lost",
};

interface LeadDetailPageProps {
  params: {
    id: string;
  };
}

export default function LeadDetailPage({ params }: LeadDetailPageProps) {
  const router = useRouter();
  const [newNote, setNewNote] = useState("");
  const [isAddingNote, setIsAddingNote] = useState(false);

  const { data: lead, isLoading, refetch } = trpc.leads.getById.useQuery(
    { id: params.id },
    { enabled: !!params.id }
  );

  const { data: notes = [], isLoading: notesLoading } = trpc.leads.getNotes.useQuery(
    { leadId: params.id },
    { enabled: !!params.id }
  );

  const updateLead = trpc.leads.update.useMutation({
    onSuccess: () => {
      toast.success("Lead updated successfully");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update lead");
    },
  });

  const deleteLead = trpc.leads.delete.useMutation({
    onSuccess: () => {
      toast.success("Lead deleted successfully");
      router.push("/leads");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete lead");
    },
  });

  const handleStatusChange = async (newStatus: LeadStatus) => {
    await updateLead.mutateAsync({
      id: params.id,
      status: newStatus,
    });
  };

  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    
    setIsAddingNote(true);
    try {
      await updateLead.mutateAsync({
        id: params.id,
        notes: lead?.notes ? `${lead.notes}\n\n[${new Date().toLocaleDateString()}] ${newNote}` : `[${new Date().toLocaleDateString()}] ${newNote}`,
      });
      setNewNote("");
    } catch (error) {
      // Error handled by mutation
    } finally {
      setIsAddingNote(false);
    }
  };

  const handleDeleteLead = async () => {
    if (window.confirm("Are you sure you want to delete this lead? This action cannot be undone.")) {
      await deleteLead.mutateAsync({ id: params.id });
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
        </div>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Lead not found</h1>
          <p className="text-gray-600">The lead you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <MainLayout 
      navigationTitle={`Lead: ${lead?.ownerName || 'Loading...'}`}
      customBackPath="/leads"
      breadcrumbs={[
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Leads', href: '/leads' },
        { label: lead?.ownerName || 'Lead Details' }
      ]}
    >
      <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => router.push('/leads')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-xl lg:text-2xl font-bold">{lead.ownerName}</h1>
            <p className="text-gray-600 text-sm lg:text-base">{lead.property.address}</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
          <Badge className={statusColors[lead.status as LeadStatus]}>
            {statusLabels[lead.status as LeadStatus]}
          </Badge>
          <Button 
            variant="default" 
            size="sm" 
            className="flex-1 lg:flex-none"
            onClick={() => router.push(`/tasks/new?leadId=${lead.id}`)}
          >
            <CheckSquare className="mr-2 h-4 w-4" />
            Create Task
          </Button>
          <Button variant="outline" size="sm" className="flex-1 lg:flex-none">
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Button 
            variant="destructive" 
            size="sm"
            onClick={handleDeleteLead}
            disabled={deleteLead.isLoading}
            className="flex-1 lg:flex-none"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="buyers">Buyer Matches</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Owner Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MessageSquare className="mr-2 h-5 w-5" />
                    Owner Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Name</label>
                      <p className="text-lg">{lead.ownerName}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Phone</label>
                      <div className="flex items-center space-x-2">
                        <p className="text-lg">{lead.ownerPhone}</p>
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => window.open(`tel:${lead.ownerPhone}`, "_self")}
                        >
                          <Phone className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  {lead.ownerEmail && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Email</label>
                      <div className="flex items-center space-x-2">
                        <p className="text-lg">{lead.ownerEmail}</p>
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => window.open(`mailto:${lead.ownerEmail}`, "_self")}
                        >
                          <Mail className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Property Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Property Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Address</label>
                      <p className="text-lg">{lead.property.address}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">City</label>
                      <p className="text-lg">{lead.property.city}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">State</label>
                      <p className="text-lg">{lead.property.state}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">ZIP Code</label>
                      <p className="text-lg">{lead.property.zipCode}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Property Type</label>
                      <p className="text-lg">{lead.property.propertyType}</p>
                    </div>
                    <div>
                       <label className="text-sm font-medium text-gray-600">Asking Price</label>
                       <p className="text-lg font-medium">{formatPrice(lead.property.askingPrice)}</p>
                     </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Bedrooms</label>
                      <p className="text-lg">{lead.property.bedrooms}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Bathrooms</label>
                      <p className="text-lg">{lead.property.bathrooms}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Square Feet</label>
                      <p className="text-lg">{lead.property.squareFeet?.toLocaleString()}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Year Built</label>
                      <p className="text-lg">{lead.property.yearBuilt}</p>
                    </div>
                  </div>
                  {lead.property.description && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Description</label>
                      <p className="text-lg mt-1">{lead.property.description}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Lead Details */}
              <Card>
                <CardHeader>
                  <CardTitle>Lead Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Timeline</label>
                      <p className="text-lg">{lead.timeline}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Motivation</label>
                      <p className="text-lg">{lead.motivation}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Source</label>
                      <p className="text-lg">{lead.source}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Created</label>
                      <p className="text-lg">{new Date(lead.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  {lead.notes && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Notes</label>
                      <p className="text-lg mt-1">{lead.notes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Status Management */}
              <Card>
                <CardHeader>
                  <CardTitle>Lead Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <Select 
                    value={lead.status} 
                    onValueChange={handleStatusChange}
                    disabled={updateLead.isLoading}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(statusLabels).map(([status, label]) => (
                        <SelectItem key={status} value={status}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button
                    variant="outline"
                    className="w-full justify-start text-sm"
                    onClick={() => window.open(`tel:${lead.ownerPhone}`)}
                  >
                    <Phone className="mr-2 h-4 w-4" />
                    Call {lead.ownerName}
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-sm"
                    onClick={() => window.open(`mailto:${lead.ownerEmail}`)}
                  >
                    <Mail className="mr-2 h-4 w-4" />
                    Email {lead.ownerName}
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-sm"
                    onClick={() => window.open(`https://maps.google.com/?q=${encodeURIComponent(lead.property.address + ', ' + lead.property.city + ', ' + lead.property.state)}`)}
                  >
                    <MapPin className="mr-2 h-4 w-4" />
                    View on Map
                  </Button>
                </CardContent>
              </Card>

              {/* Notes */}
              <Card>
                <CardHeader>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <CardTitle>Notes</CardTitle>
                    <Button
                      size="sm"
                      onClick={() => setIsAddingNote(true)}
                      className="w-full sm:w-auto"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add Note
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {isAddingNote && (
                    <div className="space-y-4 mb-4 p-4 border rounded-lg">
                      <Textarea
                        placeholder="Add a note..."
                        value={newNote}
                        onChange={(e) => setNewNote(e.target.value)}
                      />
                      <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                        <Button
                          size="sm"
                          onClick={handleAddNote}
                          disabled={!newNote.trim() || isAddingNote}
                          className="w-full sm:w-auto"
                        >
                          {isAddingNote ? 'Adding...' : 'Add Note'}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setIsAddingNote(false);
                            setNewNote('');
                          }}
                          className="w-full sm:w-auto"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                  <div className="space-y-4">
                    {notesLoading ? (
                      <div className="space-y-3">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="animate-pulse">
                            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                          </div>
                        ))}
                      </div>
                    ) : notes.length === 0 ? (
                      <p className="text-gray-500 text-center py-4">No notes yet</p>
                    ) : (
                      notes.map((note) => (
                        <div key={note.id} className="border-l-4 border-blue-500 pl-4">
                          <p className="text-sm">{note.content}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(note.createdAt).toLocaleString()}
                          </p>
                        </div>
                      ))
                    )}
                    {lead.notes && (
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <pre className="whitespace-pre-wrap text-sm">{lead.notes}</pre>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="buyers" className="space-y-6">
          <BuyerMatches
            leadId={lead.id}
            propertyPrice={lead.property.askingPrice || undefined}
            propertyType={lead.property.propertyType || undefined}
            propertyCity={lead.property.city}
            propertyState={lead.property.state}
          />
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Activity Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border-l-4 border-blue-500 pl-4">
                  <p className="font-medium">Lead Created</p>
                  <p className="text-sm text-gray-600">
                    {new Date(lead.createdAt).toLocaleDateString()} at {new Date(lead.createdAt).toLocaleTimeString()}
                  </p>
                </div>
                <div className="border-l-4 border-green-500 pl-4">
                  <p className="font-medium">Status: {statusLabels[lead.status as LeadStatus]}</p>
                  <p className="text-sm text-gray-600">
                    Last updated: {new Date(lead.updatedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      </div>
    </MainLayout>
  );
}