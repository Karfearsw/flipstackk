"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bell, Mail, MessageSquare, Smartphone } from "lucide-react";

export function NotificationSettings() {
  const [notifications, setNotifications] = useState({
    emailNotifications: "all",
    pushNotifications: "important",
    smsNotifications: "none",
    newLeads: "email",
    offerUpdates: "all",
    propertyAlerts: "email",
    taskReminders: "all",
    marketingEmails: "weekly"
  });

  const handleNotificationChange = (key: string, value: string) => {
    setNotifications(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <div className="space-y-6">
      {/* General Notification Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            General Notifications
          </CardTitle>
          <CardDescription>
            Configure how you want to receive notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="emailNotifications" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email Notifications
              </Label>
              <Select 
                value={notifications.emailNotifications} 
                onValueChange={(value) => handleNotificationChange("emailNotifications", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Notifications</SelectItem>
                  <SelectItem value="important">Important Only</SelectItem>
                  <SelectItem value="none">None</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="pushNotifications" className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                Push Notifications
              </Label>
              <Select 
                value={notifications.pushNotifications} 
                onValueChange={(value) => handleNotificationChange("pushNotifications", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Notifications</SelectItem>
                  <SelectItem value="important">Important Only</SelectItem>
                  <SelectItem value="none">None</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="smsNotifications" className="flex items-center gap-2">
                <Smartphone className="h-4 w-4" />
                SMS Notifications
              </Label>
              <Select 
                value={notifications.smsNotifications} 
                onValueChange={(value) => handleNotificationChange("smsNotifications", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Notifications</SelectItem>
                  <SelectItem value="important">Important Only</SelectItem>
                  <SelectItem value="none">None</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Activity Notifications */}
      <Card>
        <CardHeader>
          <CardTitle>Activity Notifications</CardTitle>
          <CardDescription>
            Choose how to be notified about specific activities
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="newLeads">New Leads</Label>
              <Select 
                value={notifications.newLeads} 
                onValueChange={(value) => handleNotificationChange("newLeads", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Email + Push + SMS</SelectItem>
                  <SelectItem value="email">Email Only</SelectItem>
                  <SelectItem value="push">Push Only</SelectItem>
                  <SelectItem value="none">None</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="offerUpdates">Offer Updates</Label>
              <Select 
                value={notifications.offerUpdates} 
                onValueChange={(value) => handleNotificationChange("offerUpdates", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Email + Push + SMS</SelectItem>
                  <SelectItem value="email">Email Only</SelectItem>
                  <SelectItem value="push">Push Only</SelectItem>
                  <SelectItem value="none">None</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="propertyAlerts">Property Alerts</Label>
              <Select 
                value={notifications.propertyAlerts} 
                onValueChange={(value) => handleNotificationChange("propertyAlerts", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Email + Push + SMS</SelectItem>
                  <SelectItem value="email">Email Only</SelectItem>
                  <SelectItem value="push">Push Only</SelectItem>
                  <SelectItem value="none">None</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="taskReminders">Task Reminders</Label>
              <Select 
                value={notifications.taskReminders} 
                onValueChange={(value) => handleNotificationChange("taskReminders", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Email + Push + SMS</SelectItem>
                  <SelectItem value="email">Email Only</SelectItem>
                  <SelectItem value="push">Push Only</SelectItem>
                  <SelectItem value="none">None</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Marketing Communications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Marketing Communications
          </CardTitle>
          <CardDescription>
            Control marketing and promotional emails
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div>
            <Label htmlFor="marketingEmails">Marketing Emails</Label>
            <Select 
              value={notifications.marketingEmails} 
              onValueChange={(value) => handleNotificationChange("marketingEmails", value)}
            >
              <SelectTrigger className="max-w-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily Updates</SelectItem>
                <SelectItem value="weekly">Weekly Digest</SelectItem>
                <SelectItem value="monthly">Monthly Newsletter</SelectItem>
                <SelectItem value="none">No Marketing Emails</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-gray-600 mt-1">
              Receive updates about new features, tips, and industry insights
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}