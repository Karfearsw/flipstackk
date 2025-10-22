"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Download, Calendar, DollarSign } from "lucide-react";

export function BillingSettings() {
  const [currentPlan] = useState({
    name: "Professional",
    price: 49,
    billing: "monthly",
    features: [
      "Unlimited properties",
      "Advanced analytics",
      "Team collaboration",
      "Priority support",
      "Custom integrations"
    ]
  });

  const [paymentMethods] = useState([
    { id: 1, type: "Visa", last4: "4242", expiry: "12/25", isDefault: true },
    { id: 2, type: "Mastercard", last4: "8888", expiry: "08/26", isDefault: false }
  ]);

  const [invoices] = useState([
    { id: 1, date: "2024-01-01", amount: 49, status: "Paid", downloadUrl: "#" },
    { id: 2, date: "2023-12-01", amount: 49, status: "Paid", downloadUrl: "#" },
    { id: 3, date: "2023-11-01", amount: 49, status: "Paid", downloadUrl: "#" },
    { id: 4, date: "2023-10-01", amount: 49, status: "Paid", downloadUrl: "#" }
  ]);

  return (
    <div className="space-y-6">
      {/* Current Plan */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Current Plan
          </CardTitle>
          <CardDescription>
            Manage your subscription and billing preferences
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">{currentPlan.name} Plan</h3>
                <p className="text-gray-600">
                  ${currentPlan.price}/{currentPlan.billing}
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline">Change Plan</Button>
                <Button variant="outline" className="text-red-600">Cancel Subscription</Button>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Plan Features:</h4>
              <ul className="space-y-1">
                {currentPlan.features.map((feature, index) => (
                  <li key={index} className="text-sm text-gray-600 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="pt-4 border-t">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="h-4 w-4" />
                Next billing date: February 1, 2024
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Methods */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment Methods
          </CardTitle>
          <CardDescription>
            Manage your payment methods and billing information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {paymentMethods.map((method) => (
              <div key={method.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-6 bg-gray-100 rounded flex items-center justify-center">
                    <CreditCard className="h-4 w-4 text-gray-600" />
                  </div>
                  <div>
                    <p className="font-medium">
                      {method.type} ending in {method.last4}
                    </p>
                    <p className="text-sm text-gray-600">Expires {method.expiry}</p>
                  </div>
                  {method.isDefault && (
                    <Badge variant="outline" className="text-blue-600 border-blue-200">
                      Default
                    </Badge>
                  )}
                </div>
                <div className="flex gap-2">
                  {!method.isDefault && (
                    <Button variant="ghost" size="sm">
                      Set as Default
                    </Button>
                  )}
                  <Button variant="ghost" size="sm" className="text-red-600">
                    Remove
                  </Button>
                </div>
              </div>
            ))}
            
            <Button variant="outline" className="w-full">
              <CreditCard className="h-4 w-4 mr-2" />
              Add Payment Method
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Billing History */}
      <Card>
        <CardHeader>
          <CardTitle>Billing History</CardTitle>
          <CardDescription>
            View and download your past invoices
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {invoices.map((invoice) => (
              <div key={invoice.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div>
                    <p className="font-medium">
                      Invoice #{invoice.id.toString().padStart(4, '0')}
                    </p>
                    <p className="text-sm text-gray-600">
                      {new Date(invoice.date).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium">${invoice.amount}</p>
                    <Badge 
                      variant="outline" 
                      className={invoice.status === 'Paid' ? 'text-green-600 border-green-200' : 'text-red-600 border-red-200'}
                    >
                      {invoice.status}
                    </Badge>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Usage & Limits */}
      <Card>
        <CardHeader>
          <CardTitle>Usage & Limits</CardTitle>
          <CardDescription>
            Monitor your current usage against plan limits
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Properties</span>
                <span>45 / Unlimited</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: '45%' }}></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Team Members</span>
                <span>3 / 10</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full" style={{ width: '30%' }}></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>API Calls (Monthly)</span>
                <span>1,250 / 10,000</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-yellow-600 h-2 rounded-full" style={{ width: '12.5%' }}></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}