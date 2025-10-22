"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";

interface ReportsChartsProps {
  data: {
    monthlyRevenue: Array<{ month: string; revenue: number; deals: number }>;
    propertyTypes: Array<{ type: string; count: number; percentage: number }>;
    offerStatus: Array<{ status: string; count: number; percentage: number }>;
  };
}

const COLORS = ['#000000', '#FF0000', '#666666', '#333333', '#999999', '#CCCCCC'];

export function ReportsCharts({ data }: ReportsChartsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Monthly Revenue Chart */}
      <Card className="col-span-1 lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-black">Monthly Revenue &amp; Deals</CardTitle>
          <CardDescription className="text-black">
            Track your revenue and deal volume over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.monthlyRevenue}>
                <CartesianGrid strokeDasharray="3 3" stroke="#CCCCCC" />
                <XAxis dataKey="month" stroke="#000000" />
                <YAxis yAxisId="left" stroke="#000000" />
                <YAxis yAxisId="right" orientation="right" stroke="#000000" />
                <Tooltip 
                  formatter={(value, name) => [
                    name === 'revenue' ? `$${value.toLocaleString()}` : value,
                    name === 'revenue' ? 'Revenue' : 'Deals'
                  ]}
                  contentStyle={{ backgroundColor: '#FFFFFF', border: '1px solid #000000', color: '#000000' }}
                />
                <Bar yAxisId="left" dataKey="revenue" fill="#FF0000" name="revenue" />
                <Bar yAxisId="right" dataKey="deals" fill="#000000" name="deals" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Property Types Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="text-black">Property Types</CardTitle>
          <CardDescription className="text-black">
            Distribution of properties by type
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.propertyTypes}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ type, percentage }) => `${type} (${percentage}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {data.propertyTypes.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => [value, 'Properties']} 
                  contentStyle={{ backgroundColor: '#FFFFFF', border: '1px solid #000000', color: '#000000' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Offer Status Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="text-black">Offer Status</CardTitle>
          <CardDescription className="text-black">
            Current status of all offers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.offerStatus}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ status, percentage }) => `${status} (${percentage}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {data.offerStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => [value, 'Offers']} 
                  contentStyle={{ backgroundColor: '#FFFFFF', border: '1px solid #000000', color: '#000000' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}