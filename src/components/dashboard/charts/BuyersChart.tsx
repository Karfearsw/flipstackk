"use client";

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { trpc } from '@/lib/trpc-client';
import { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface BuyersChartProps {
  className?: string;
}

export function BuyersChart({ className }: BuyersChartProps) {
  const [days, setDays] = useState(30);
  
  const { data: chartData, isLoading, error } = trpc.analytics.getBuyersChart.useQuery({ days });

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-black">Buyer Engagement</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-black">Buyer Engagement</CardTitle>
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
        <CardTitle className="text-base font-medium text-black">Buyer Engagement</CardTitle>
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
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#CCCCCC" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12, fill: '#000000' }}
                tickFormatter={(value) => new Date(value).toLocaleDateString()}
                stroke="#000000"
              />
              <YAxis tick={{ fontSize: 12, fill: '#000000' }} stroke="#000000" />
              <Tooltip 
                labelFormatter={(value) => new Date(value).toLocaleDateString()}
                formatter={(value: number, name: string) => [value, name.charAt(0).toUpperCase() + name.slice(1)]}
                contentStyle={{ backgroundColor: '#FFFFFF', border: '1px solid #000000', color: '#000000' }}
              />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="new" 
                stackId="1"
                stroke="#FF0000" 
                fill="#FF0000"
                fillOpacity={0.6}
                name="New Buyers"
              />
              <Area 
                type="monotone" 
                dataKey="active" 
                stackId="1"
                stroke="#000000" 
                fill="#000000"
                fillOpacity={0.6}
                name="Active Buyers"
              />
              <Area 
                type="monotone" 
                dataKey="withOffers" 
                stackId="1"
                stroke="#666666" 
                fill="#666666"
                fillOpacity={0.6}
                name="With Offers"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

export default BuyersChart;