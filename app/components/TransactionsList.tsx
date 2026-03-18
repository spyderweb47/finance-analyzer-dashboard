'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { Transaction } from '../lib/analyzer';

interface TransactionsListProps {
  transactions: Transaction[];
}

const CATEGORY_COLORS: Record<string, string> = {
  'Food & Dining': 'bg-orange-100 text-orange-800',
  'Groceries': 'bg-green-100 text-green-800',
  'Transportation': 'bg-blue-100 text-blue-800',
  'Shopping': 'bg-pink-100 text-pink-800',
  'Entertainment': 'bg-purple-100 text-purple-800',
  'Bills & Utilities': 'bg-yellow-100 text-yellow-800',
  'Health & Medical': 'bg-red-100 text-red-800',
  'Cash & ATM': 'bg-gray-100 text-gray-800',
  'Subscriptions': 'bg-indigo-100 text-indigo-800',
  'Fitness': 'bg-teal-100 text-teal-800',
  'Personal Care': 'bg-rose-100 text-rose-800',
  'Transfers': 'bg-cyan-100 text-cyan-800',
  'Income': 'bg-green-100 text-green-800',
  'Person-to-Person': 'bg-blue-100 text-blue-800',
  'Others': 'bg-gray-100 text-gray-800',
};

export default function TransactionsList({ transactions }: TransactionsListProps) {
  const [filter, setFilter] = useState<'all' | 'expense' | 'income'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTransactions = transactions
    .filter(t => filter === 'all' || t.type === filter)
    .filter(t => 
      t.narration.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.category.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .slice(0, 50);

  return (
    <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
      <div className="px-6 py-4 border-b">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Transactions</h3>
            <p className="text-sm text-gray-500 mt-1">Showing latest 50 transactions</p>
          </div>
          
          <div className="flex gap-2">
            {(['all', 'expense', 'income'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setFilter(type)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  filter === type
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4">
          <input
            type="text"
            placeholder="Search transactions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-80 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
          />
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Description
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredTransactions.map((transaction) => (
              <tr key={transaction.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {format(transaction.date, 'dd MMM yyyy')}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900 max-w-md truncate">
                  {transaction.narration}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                    CATEGORY_COLORS[transaction.category] || CATEGORY_COLORS['Others']
                  }`}>
                    {transaction.category}
                  </span>
                </td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium text-right ${
                  transaction.type === 'income' ? 'text-green-600' : 'text-gray-900'
                }`}>
                  {transaction.type === 'income' ? '+' : '-'}Rs.{transaction.amount.toLocaleString('en-IN')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {filteredTransactions.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No transactions found matching your filters.
        </div>
      )}
    </div>
  );
}
