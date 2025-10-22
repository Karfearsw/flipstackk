"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { trpc } from '@/lib/trpc-client';
import { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface LeadsChartProps {
  className?: string;
}

export function LeadsChart({ className }: LeadsChartProps) {
  const [days, setDays] = useState(30);
  
  const { data: chartData, isLoading, error } = trpc.analytics.getLeadsChart.useQuery({ days });

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Leads Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Leads Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center text-red-500">
            Error loading chart data
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-medium">Leads Over Time</CardTitle>
        <Select value={days.toString()} onValueChange={(value) => setDays(parseInt(value))}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">7 days</SelectItem>
            <SelectItem value="30">30 days</SelectItem>
            <SelectItem value="90">90 days</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => new Date(value).toLocaleDateString()}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip 
                labelFormatter={(value) => new Date(value).toLocaleDateString()}
                formatter={(value: number, name: string) => [value, name.charAt(0).toUpperCase() + name.slice(1)]}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="new" 
                stroke="#3b82f6" 
                strokeWidth={2}
                name="New"
              />
              <Line 
                type="monotone" 
                dataKey="contacted" 
                stroke="#10b981" 
                strokeWidth={2}
                name="Contacted"
              />
              <Line 
                type="monotone" 
                dataKey="qualified" 
                stroke="#f59e0b" 
                strokeWidth={2}
                name="Qualified"
              />
              <Line 
                type="monotone" 
                dataKey="converted" 
                stroke="#059669" 
                strokeWidth={2}
                name="Converted"
              />
              <Line 
                type="monotone" 
                dataKey="lost" 
                stroke="#dc2626" 
                strokeWidth={2}
                name="Lost"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

export default LeadsChart;