"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { trpc } from '@/lib/trpc-client';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { Users, UserCheck, CheckSquare, DollarSign, Clock, Plus } from 'lucide-react';

interface ActivityFeedProps {
  className?: string;
}

const getActivityIcon = (type: string) => {
  switch (type) {
    case 'lead':
      return Users;
    case 'buyer':
      return UserCheck;
    case 'task':
      return CheckSquare;
    case 'offer':
      return DollarSign;
    default:
      return Plus;
  }
};

const getActivityColor = (type: string) => {
  switch (type) {
    case 'lead':
      return 'bg-gray-100 text-black';
    case 'buyer':
      return 'bg-gray-100 text-black';
    case 'task':
      return 'bg-gray-100 text-black';
    case 'offer':
      return 'bg-red-500 text-white';
    default:
      return 'bg-gray-100 text-black';
  }
};

export function ActivityFeed({ className }: ActivityFeedProps) {
  const { data: activities, isLoading, error } = trpc.analytics.getActivityFeed.useQuery();

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-base font-medium text-black">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-3 bg-gray-100 rounded animate-pulse w-24"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !activities) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-base font-medium text-black">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-red-500 py-8">
            Error loading activity feed
          </div>
        </CardContent>
      </Card>
    );
  }

  if (activities.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-base font-medium text-black">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-black py-8">
            <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No recent activity</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-base font-medium text-black">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {activities.map((activity) => {
            const Icon = getActivityIcon(activity.type);
            return (
              <div key={activity.id} className="flex items-start space-x-3">
                <Avatar className="w-8 h-8">
                  <AvatarFallback className={getActivityColor(activity.type)}>
                    <Icon className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <p className="text-sm font-medium text-black truncate">
                      {activity.title}
                    </p>
                    <Badge variant="secondary" className="text-xs">
                      {activity.type}
                    </Badge>
                  </div>
                  <p className="text-sm text-black mt-1">
                    {activity.description}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}