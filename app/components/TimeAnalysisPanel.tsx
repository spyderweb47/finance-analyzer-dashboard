'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TimeAnalysis, DailySpending } from '../lib/analyzer';
import { format, parseISO } from 'date-fns';

interface TimeAnalysisProps {
  timeAnalysis: TimeAnalysis;
}

export default function TimeAnalysisPanel({ timeAnalysis }: TimeAnalysisProps) {
  const { byDayOfWeek, weekendVsWeekday, mostActiveDay, quietestDay, spendingVelocity } = timeAnalysis;
  
  const weekendData = [
    { name: 'Weekend', value: weekendVsWeekday.weekend, fill: '#10b981' },
    { name: 'Weekday', value: weekendVsWeekday.weekday, fill: '#3b82f6' },
  ];
  
  const total = weekendVsWeekday.weekend + weekendVsWeekday.weekday;
  const weekendPercent = total > 0 ? (weekendVsWeekday.weekend / total) * 100 : 0;

  // Type guard for mostActiveDay and quietestDay
  const formatMostActiveDay = (day: DailySpending | null): string => {
    if (!day) return 'N/A';
    return format(parseISO(day.date), 'dd MMM');
  };

  const formatQuietestDay = (day: DailySpending | null): string => {
    if (!day) return 'N/A';
    return format(parseISO(day.date), 'dd MMM');
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
        <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Time Analysis
      </h3>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Day of Week Chart */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-4">Spending by Day of Week</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byDayOfWeek} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" tickFormatter={(v) => `Rs.${(v/1000).toFixed(0)}k`} />
                <YAxis dataKey="day" type="category" width={80} tick={{ fontSize: 12 }} />
                <Tooltip 
                  formatter={(value: number) => [`Rs.${value.toLocaleString()}`, 'Amount']}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="amount" fill="#3b82f6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Weekend vs Weekday */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-4">Weekend vs Weekday Spending</h4>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={weekendData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {weekendData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number) => `Rs.${v.toLocaleString()}`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <p className="text-center text-sm text-gray-600 mt-2">
            {weekendPercent.toFixed(1)}% spent on weekends
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-6 border-t">
        <div className="text-center">
          <p className="text-sm text-gray-500">Most Active Day</p>
          <p className="text-lg font-semibold text-gray-900">{formatMostActiveDay(mostActiveDay)}</p>
          <p className="text-xs text-primary-600">Rs.{mostActiveDay?.amount.toLocaleString() || 0}</p>
        </div>
        
        <div className="text-center">
          <p className="text-sm text-gray-500">Quietest Day</p>
          <p className="text-lg font-semibold text-gray-900">{formatQuietestDay(quietestDay)}</p>
          <p className="text-xs text-green-600">Rs.{quietestDay?.amount.toLocaleString() || 0}</p>
        </div>
        
        <div className="text-center">
          <p className="text-sm text-gray-500">Daily Velocity</p>
          <p className="text-lg font-semibold text-gray-900">{spendingVelocity.toFixed(1)}</p>
          <p className="text-xs text-gray-500">transactions/day</p>
        </div>
        
        <div className="text-center">
          <p className="text-sm text-gray-500">Median Transaction</p>
          <p className="text-lg font-semibold text-gray-900">Rs.{timeAnalysis.medianTransactionSize.toLocaleString()}</p>
          <p className="text-xs text-gray-500">typical size</p>
        </div>
      </div>

      {/* Category Trends */}
      {timeAnalysis.categoryTrends.length > 0 && (
        <div className="mt-8 pt-6 border-t">
          <h4 className="text-sm font-medium text-gray-700 mb-4">Daily Average by Category</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {timeAnalysis.categoryTrends.map((cat) => (
              <div key={cat.category} className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500 truncate">{cat.category}</p>
                <p className="text-lg font-semibold text-gray-900">Rs.{cat.dailyAverage.toFixed(0)}</p>
                <p className="text-xs text-gray-400">per day</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
