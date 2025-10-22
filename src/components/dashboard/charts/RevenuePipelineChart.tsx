"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { trpc } from '@/lib/trpc-client';

interface RevenuePipelineChartProps {
  className?: string;
}

const COLORS = ['#3b82f6', '#10b981', '#dc2626'];

export function RevenuePipelineChart({ className }: RevenuePipelineChartProps) {
  const { data: pipelineData, isLoading, error } = trpc.analytics.getRevenuePipeline.useQuery();

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Revenue Pipeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !pipelineData) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Revenue Pipeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center text-red-500">
            Error loading pipeline data
          </div>
        </CardContent>
      </Card>
    );
  }

  const chartData = [
    { name: 'Pending', value: pipelineData.pending, count: pipelineData.pendingCount },
    { name: 'Accepted', value: pipelineData.accepted, count: pipelineData.acceptedCount },
    { name: 'Rejected', value: pipelineData.rejected, count: pipelineData.rejectedCount },
  ].filter(item => item.value > 0);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-medium">{data.name}</p>
          <p className="text-sm text-gray-600">
            Value: ${data.value.toLocaleString()}
          </p>
          <p className="text-sm text-gray-600">
            Count: {data.count} offers
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-base font-medium">Revenue Pipeline</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Total Value</p>
              <p className="text-2xl font-bold">${pipelineData.totalValue.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-gray-600">Average Offer</p>
              <p className="text-2xl font-bold">${Math.round(pipelineData.averageOffer).toLocaleString()}</p>
            </div>
          </div>
          
          {chartData.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500">
              No offer data available
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default RevenuePipelineChart;