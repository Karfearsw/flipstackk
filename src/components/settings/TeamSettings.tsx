"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Users, Plus, Mail, MoreHorizontal, Shield, UserX } from "lucide-react";

export function TeamSettings() {
  const [teamMembers] = useState([
    { 
      id: 1, 
      name: "John Doe", 
      email: "john.doe@example.com", 
      role: "Owner", 
      status: "Active",
      joinedDate: "2023-01-15",
      lastActive: "2 minutes ago"
    },
    { 
      id: 2, 
      name: "Sarah Johnson", 
      email: "sarah.j@example.com", 
      role: "Admin", 
      status: "Active",
      joinedDate: "2023-03-20",
      lastActive: "1 hour ago"
    },
    { 
      id: 3, 
      name: "Mike Wilson", 
      email: "mike.w@example.com", 
      role: "Member", 
      status: "Active",
      joinedDate: "2023-06-10",
      lastActive: "3 days ago"
    },
    { 
      id: 4, 
      name: "Lisa Brown", 
      email: "lisa.b@example.com", 
      role: "Member", 
      status: "Pending",
      joinedDate: "2024-01-10",
      lastActive: "Never"
    }
  ]);

  const [inviteData, setInviteData] = useState({
    email: "",
    role: "Member"
  });

  const handleInviteChange = (field: string, value: string) => {
    setInviteData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSendInvite = () => {
    console.log("Sending invite to:", inviteData);
    setInviteData({ email: "", role: "Member" });
  };

  const getRoleBadge = (role: string) => {
    const roleColors = {
      'Owner': 'bg-purple-100 text-purple-800',
      'Admin': 'bg-blue-100 text-blue-800',
      'Member': 'bg-gray-100 text-gray-800'
    };
    
    return (
      <Badge className={roleColors[role as keyof typeof roleColors]}>
        {role}
      </Badge>
    );
  };

  const getStatusBadge = (status: string) => {
    const statusColors = {
      'Active': 'bg-green-100 text-green-800',
      'Pending': 'bg-yellow-100 text-yellow-800',
      'Inactive': 'bg-red-100 text-red-800'
    };
    
    return (
      <Badge className={statusColors[status as keyof typeof statusColors]}>
        {status}
      </Badge>
    );
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className="space-y-6">
      {/* Team Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Team Overview
          </CardTitle>
          <CardDescription>
            Manage your team members and their permissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{teamMembers.length}</div>
              <div className="text-sm text-blue-600">Total Members</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {teamMembers.filter(m => m.status === 'Active').length}
              </div>
              <div className="text-sm text-green-600">Active Members</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">
                {teamMembers.filter(m => m.status === 'Pending').length}
              </div>
              <div className="text-sm text-yellow-600">Pending Invites</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Invite Team Member */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Invite Team Member
          </CardTitle>
          <CardDescription>
            Send an invitation to add a new team member
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="inviteEmail">Email Address</Label>
              <Input
                id="inviteEmail"
                type="email"
                value={inviteData.email}
                onChange={(e) => handleInviteChange("email", e.target.value)}
                placeholder="colleague@example.com"
              />
            </div>
            <div className="sm:w-40">
              <Label htmlFor="inviteRole">Role</Label>
              <Select value={inviteData.role} onValueChange={(value) => handleInviteChange("role", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Admin">Admin</SelectItem>
                  <SelectItem value="Member">Member</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="sm:pt-6">
              <Button onClick={handleSendInvite} className="w-full sm:w-auto">
                <Mail className="h-4 w-4 mr-2" />
                Send Invite
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Team Members List */}
      <Card>
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
          <CardDescription>
            Manage existing team members and their roles
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {teamMembers.map((member) => (
              <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-blue-100 text-blue-600">
                      {getInitials(member.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{member.name}</p>
                      {getRoleBadge(member.role)}
                      {getStatusBadge(member.status)}
                    </div>
                    <p className="text-sm text-gray-600">{member.email}</p>
                    <p className="text-xs text-gray-500">
                      Joined {new Date(member.joinedDate).toLocaleDateString()} • 
                      Last active: {member.lastActive}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {member.role !== 'Owner' && (
                    <>
                      <Select defaultValue={member.role}>
                        <SelectTrigger className="w-24">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Admin">Admin</SelectItem>
                          <SelectItem value="Member">Member</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      <Button variant="ghost" size="sm" className="text-red-600">
                        <UserX className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                  
                  {member.role === 'Owner' && (
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Shield className="h-4 w-4" />
                      Account Owner
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Role Permissions */}
      <Card>
        <CardHeader>
          <CardTitle>Role Permissions</CardTitle>
          <CardDescription>
            Understanding what each role can do in your workspace
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <Shield className="h-5 w-5 text-purple-600" />
                  <h3 className="font-semibold text-purple-600">Owner</h3>
                </div>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>• Full access to all features</li>
                  <li>• Manage billing and subscription</li>
                  <li>• Add/remove team members</li>
                  <li>• Change user roles</li>
                  <li>• Delete workspace</li>
                </ul>
              </div>
              
              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <Shield className="h-5 w-5 text-blue-600" />
                  <h3 className="font-semibold text-blue-600">Admin</h3>
                </div>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>• Manage properties and offers</li>
                  <li>• View all reports</li>
                  <li>• Invite team members</li>
                  <li>• Manage team settings</li>
                  <li>• Cannot access billing</li>
                </ul>
              </div>
              
              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <Shield className="h-5 w-5 text-gray-600" />
                  <h3 className="font-semibold text-gray-600">Member</h3>
                </div>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>• View and edit properties</li>
                  <li>• Create and manage offers</li>
                  <li>• View basic reports</li>
                  <li>• Manage own tasks</li>
                  <li>• Cannot invite users</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}