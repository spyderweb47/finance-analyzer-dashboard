import { format } from 'date-fns';
import { Summary } from '../lib/analyzer';

interface SummaryCardsProps {
  summary: Summary;
}

export default function SummaryCards({ summary }: SummaryCardsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const cards = [
    {
      title: 'Total Expenses',
      value: formatCurrency(summary.totalExpenses),
      change: `${summary.expenseCount} transactions`,
      color: 'red',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
        </svg>
      ),
    },
    {
      title: 'Total Income',
      value: formatCurrency(summary.totalIncome),
      change: `${summary.incomeCount} transactions`,
      color: 'green',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      ),
    },
    {
      title: 'Net Cashflow',
      value: formatCurrency(summary.netCashflow),
      change: summary.netCashflow >= 0 ? 'Surplus' : 'Deficit',
      color: summary.netCashflow >= 0 ? 'green' : 'red',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      title: 'Savings Rate',
      value: `${summary.savingsRate.toFixed(1)}%`,
      change: summary.savingsRate >= 20 ? 'Healthy' : summary.savingsRate > 0 ? 'Low' : 'Negative',
      color: summary.savingsRate >= 20 ? 'green' : summary.savingsRate > 0 ? 'yellow' : 'red',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
    },
  ];

  const colorClasses: Record<string, { bg: string; text: string; light: string }> = {
    red: { bg: 'bg-red-600', text: 'text-red-600', light: 'bg-red-50' },
    green: { bg: 'bg-green-600', text: 'text-green-600', light: 'bg-green-50' },
    yellow: { bg: 'bg-yellow-600', text: 'text-yellow-600', light: 'bg-yellow-50' },
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => (
        <div key={index} className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-lg ${colorClasses[card.color].light}`}>
              <div className={colorClasses[card.color].text}>{card.icon}</div>
            </div>
            <span className="text-sm text-gray-500">
              {format(summary.startDate, 'dd MMM')} - {format(summary.endDate, 'dd MMM')}
            </span>
          </div>
          <p className="text-sm text-gray-600 mb-1">{card.title}</p>
          <p className="text-2xl font-bold text-gray-900">{card.value}</p>
          <p className={`text-sm mt-2 ${colorClasses[card.color].text}`}>{card.change}</p>
        </div>
      ))}
    </div>
  );
}
