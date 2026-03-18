'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DailySpending } from '../lib/analyzer';
import { format, parseISO } from 'date-fns';

interface SpendingTrendProps {
  dailySpending: DailySpending[];
}

export default function SpendingTrend({ dailySpending }: SpendingTrendProps) {
  const data = dailySpending.map(day => ({
    date: format(parseISO(day.date), 'dd MMM'),
    amount: day.amount,
    count: day.count,
    fullDate: day.date,
  }));

  return (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Daily Spending Trend</h3>
      
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(value) => `Rs.${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip
              formatter={(value: number, name: string, props: any) => {
                return [`Rs.${value.toLocaleString('en-IN')}`, 'Amount'];
              }}
              labelFormatter={(label: string) => {
                const item = data.find(d => d.date === label);
                return item ? `${label} (${item.count} transactions)` : label;
              }}
              contentStyle={{ 
                backgroundColor: 'white', 
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '12px'
              }}
            />
            <Bar 
              dataKey="amount" 
              fill="#3b82f6" 
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Stats */}
      {dailySpending.length > 0 && (
        <div className="mt-6 grid grid-cols-3 gap-4 pt-6 border-t">
          <div>
            <p className="text-sm text-gray-500">Highest Day</p>
            <p className="text-lg font-semibold text-gray-900">
              Rs.{Math.max(...dailySpending.map(d => d.amount)).toLocaleString('en-IN')}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Average Day</p>
            <p className="text-lg font-semibold text-gray-900">
              Rs.{(dailySpending.reduce((sum, d) => sum + d.amount, 0) / dailySpending.length).toLocaleString('en-IN')}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Active Days</p>
            <p className="text-lg font-semibold text-gray-900">
              {dailySpending.length} days
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
