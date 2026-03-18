'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { CategoryStat } from '../lib/analyzer';

interface CategoryChartProps {
  categories: CategoryStat[];
}

const COLORS = [
  '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6',
  '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1',
  '#14b8a6', '#f43f5e', '#8b5cf6', '#a855f7'
];

export default function CategoryChart({ categories }: CategoryChartProps) {
  const data = categories.slice(0, 8).map(cat => ({
    name: cat.category,
    value: cat.total,
    percentage: cat.percentage,
    count: cat.count,
  }));

  return (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Spending by Category</h3>
      
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percentage }) => `${percentage.toFixed(0)}%`}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number, name: string, props: any) => {
                return [`Rs.${value.toLocaleString('en-IN')}`, name];
              }}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Category List */}
      <div className="mt-6 space-y-3">
        {categories.slice(0, 5).map((cat, index) => (
          <div key={cat.category} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              />
              <span className="text-sm text-gray-700">{cat.category}</span>
            </div>
            <div className="text-right">
              <span className="text-sm font-medium text-gray-900">
                Rs.{cat.total.toLocaleString('en-IN')}
              </span>
              <span className="text-xs text-gray-500 ml-2">({cat.count})</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
