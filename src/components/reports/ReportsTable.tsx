"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Download } from "lucide-react";

interface ReportsTableProps {
  reportType: string;
  dateRange: string;
}

// Mock data for different report types
const mockData = {
  overview: [
    { id: 1, date: "2024-01-15", type: "Property Sale", description: "123 Main St", amount: 450000, status: "Completed" },
    { id: 2, date: "2024-01-12", type: "Offer Accepted", description: "456 Oak Ave", amount: 325000, status: "In Progress" },
    { id: 3, date: "2024-01-10", type: "Property Listed", description: "789 Pine Rd", amount: 275000, status: "Active" },
    { id: 4, date: "2024-01-08", type: "Offer Submitted", description: "321 Elm St", amount: 520000, status: "Pending" },
  ],
  properties: [
    { id: 1, address: "123 Main St", type: "Single Family", price: 450000, status: "Sold", daysOnMarket: 25 },
    { id: 2, address: "456 Oak Ave", type: "Condo", price: 325000, status: "Under Contract", daysOnMarket: 18 },
    { id: 3, address: "789 Pine Rd", type: "Townhouse", price: 275000, status: "Available", daysOnMarket: 45 },
    { id: 4, address: "321 Elm St", type: "Single Family", price: 520000, status: "Available", daysOnMarket: 12 },
  ],
  offers: [
    { id: 1, buyer: "John Smith", property: "123 Main St", offerAmount: 445000, listPrice: 450000, status: "Accepted" },
    { id: 2, buyer: "Sarah Johnson", property: "456 Oak Ave", offerAmount: 320000, listPrice: 325000, status: "Pending" },
    { id: 3, buyer: "Mike Wilson", property: "789 Pine Rd", offerAmount: 270000, listPrice: 275000, status: "Countered" },
    { id: 4, buyer: "Lisa Brown", property: "321 Elm St", offerAmount: 500000, listPrice: 520000, status: "Rejected" },
  ],
  financial: [
    { id: 1, date: "2024-01-15", description: "Commission - 123 Main St", category: "Revenue", amount: 27000 },
    { id: 2, date: "2024-01-12", description: "Marketing Expenses", category: "Expense", amount: -2500 },
    { id: 3, date: "2024-01-10", description: "Staging Costs - 789 Pine Rd", category: "Expense", amount: -1800 },
    { id: 4, date: "2024-01-08", description: "Commission - 456 Oak Ave", category: "Revenue", amount: 19500 },
  ]
};

export function ReportsTable({ reportType, dateRange }: ReportsTableProps) {
  const data = mockData[reportType as keyof typeof mockData] || mockData.overview;

  const getStatusBadge = (status: string) => {
    const statusColors = {
      'Completed': 'bg-green-100 text-green-800',
      'In Progress': 'bg-blue-100 text-blue-800',
      'Active': 'bg-yellow-100 text-yellow-800',
      'Pending': 'bg-orange-100 text-orange-800',
      'Sold': 'bg-green-100 text-green-800',
      'Under Contract': 'bg-blue-100 text-blue-800',
      'Available': 'bg-gray-100 text-gray-800',
      'Accepted': 'bg-green-100 text-green-800',
      'Rejected': 'bg-red-100 text-red-800',
      'Countered': 'bg-yellow-100 text-yellow-800',
      'Revenue': 'bg-green-100 text-green-800',
      'Expense': 'bg-red-100 text-red-800'
    };
    
    return (
      <Badge className={statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'}>
        {status}
      </Badge>
    );
  };

  const renderTableContent = () => {
    switch (reportType) {
      case 'properties':
        return (
          <>
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 font-medium">Address</th>
                <th className="text-left py-3 px-4 font-medium">Type</th>
                <th className="text-left py-3 px-4 font-medium">Price</th>
                <th className="text-left py-3 px-4 font-medium">Status</th>
                <th className="text-left py-3 px-4 font-medium">Days on Market</th>
                <th className="text-left py-3 px-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item: any) => (
                <tr key={item.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4">{item.address}</td>
                  <td className="py-3 px-4">{item.type}</td>
                  <td className="py-3 px-4">${item.price?.toLocaleString()}</td>
                  <td className="py-3 px-4">{getStatusBadge(item.status)}</td>
                  <td className="py-3 px-4">{item.daysOnMarket} days</td>
                  <td className="py-3 px-4">
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </>
        );
      
      case 'offers':
        return (
          <>
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 font-medium">Buyer</th>
                <th className="text-left py-3 px-4 font-medium">Property</th>
                <th className="text-left py-3 px-4 font-medium">Offer Amount</th>
                <th className="text-left py-3 px-4 font-medium">List Price</th>
                <th className="text-left py-3 px-4 font-medium">Status</th>
                <th className="text-left py-3 px-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item: any) => (
                <tr key={item.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4">{item.buyer}</td>
                  <td className="py-3 px-4">{item.property}</td>
                  <td className="py-3 px-4">${item.offerAmount?.toLocaleString()}</td>
                  <td className="py-3 px-4">${item.listPrice?.toLocaleString()}</td>
                  <td className="py-3 px-4">{getStatusBadge(item.status)}</td>
                  <td className="py-3 px-4">
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </>
        );
      
      case 'financial':
        return (
          <>
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 font-medium">Date</th>
                <th className="text-left py-3 px-4 font-medium">Description</th>
                <th className="text-left py-3 px-4 font-medium">Category</th>
                <th className="text-left py-3 px-4 font-medium">Amount</th>
                <th className="text-left py-3 px-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item: any) => (
                <tr key={item.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4">{new Date(item.date).toLocaleDateString()}</td>
                  <td className="py-3 px-4">{item.description}</td>
                  <td className="py-3 px-4">{getStatusBadge(item.category)}</td>
                  <td className="py-3 px-4 font-medium">
                    <span className={item.amount > 0 ? 'text-green-600' : 'text-red-600'}>
                      ${Math.abs(item.amount).toLocaleString()}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </>
        );
      
      default: // overview
        return (
          <>
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 font-medium">Date</th>
                <th className="text-left py-3 px-4 font-medium">Type</th>
                <th className="text-left py-3 px-4 font-medium">Description</th>
                <th className="text-left py-3 px-4 font-medium">Amount</th>
                <th className="text-left py-3 px-4 font-medium">Status</th>
                <th className="text-left py-3 px-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item: any) => (
                <tr key={item.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4">{new Date(item.date).toLocaleDateString()}</td>
                  <td className="py-3 px-4">{item.type}</td>
                  <td className="py-3 px-4">{item.description}</td>
                  <td className="py-3 px-4">${item.amount?.toLocaleString()}</td>
                  <td className="py-3 px-4">{getStatusBadge(item.status)}</td>
                  <td className="py-3 px-4">
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </>
        );
    }
  };

  const getTableTitle = () => {
    switch (reportType) {
      case 'properties': return 'Properties Report';
      case 'offers': return 'Offers Report';
      case 'financial': return 'Financial Report';
      default: return 'Activity Overview';
    }
  };

  const getTableDescription = () => {
    switch (reportType) {
      case 'properties': return 'Detailed view of all properties and their performance';
      case 'offers': return 'Complete overview of all offers and their current status';
      case 'financial': return 'Financial transactions and revenue breakdown';
      default: return 'Recent activity and transactions overview';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{getTableTitle()}</CardTitle>
            <CardDescription>{getTableDescription()}</CardDescription>
          </div>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            {renderTableContent()}
          </table>
        </div>
      </CardContent>
    </Card>
  );
}