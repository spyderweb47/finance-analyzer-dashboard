'use client';

import { useState, useCallback } from 'react';
import FileUpload from './components/FileUpload';
import SummaryCards from './components/SummaryCards';
import CategoryChart from './components/CategoryChart';
import MerchantTable from './components/MerchantTable';
import TransactionsList from './components/TransactionsList';
import SpendingTrend from './components/SpendingTrend';
import InsightsPanel from './components/InsightsPanel';
import TimeAnalysisPanel from './components/TimeAnalysisPanel';
import DetailedReportPanel from './components/DetailedReportPanel';
import { analyzeStatement, AnalysisResult } from './lib/analyzer';

type ViewTab = 'overview' | 'time' | 'report' | 'transactions';

export default function Home() {
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<ViewTab>('overview');

  const handleFileUpload = useCallback(async (file: File) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Uploading file:', file.name);
      const result = await analyzeStatement(file);
      console.log('Analysis complete:', result);
      setAnalysis(result);
      setActiveTab('overview');
    } catch (err) {
      console.error('Analysis error:', err);
      setError(err instanceof Error ? err.message : 'Failed to analyze statement');
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Finance Analyzer</h1>
              <p className="mt-2 text-gray-600">Upload your HDFC bank statement for comprehensive spending insights</p>
            </div>
            
            {analysis && (
              <div className="text-sm text-gray-500 bg-gray-100 px-4 py-2 rounded-lg">
                {analysis.summary.expenseCount + analysis.summary.incomeCount} transactions analyzed
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Upload Section */}
        <div className="mb-8">
          <FileUpload onFileUpload={handleFileUpload} loading={loading} />
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-red-700 font-medium">{error}</span>
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        {analysis && (
          <div className="mb-6 border-b border-gray-200">
            <nav className="flex space-x-8 overflow-x-auto">
              {[
                { id: 'overview', label: 'Overview', icon: '📊' },
                { id: 'time', label: 'Time Analysis', icon: '⏰' },
                { id: 'report', label: 'Detailed Report', icon: '📄' },
                { id: 'transactions', label: 'Transactions', icon: '💳' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as ViewTab)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        )}

        {/* Analysis Results */}
        {analysis && (
          <div className="animate-fadeIn">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-8">
                <SummaryCards summary={analysis.summary} />
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <CategoryChart categories={analysis.categoryStats} />
                  <SpendingTrend dailySpending={analysis.dailySpending} />
                </div>

                <InsightsPanel insights={analysis.insights} />
                
                <MerchantTable merchants={analysis.merchantStats} />
              </div>
            )}

            {/* Time Analysis Tab */}
            {activeTab === 'time' && (
              <div className="space-y-8">
                <TimeAnalysisPanel timeAnalysis={analysis.timeAnalysis} />
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white rounded-xl shadow-sm border p-6">
                    <h4 className="text-sm font-medium text-gray-700 mb-4">Transaction Statistics</h4>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Transactions</span>
                        <span className="font-medium">{analysis.summary.transactionCount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Avg Transaction</span>
                        <span className="font-medium">Rs.{analysis.summary.avgExpense.toFixed(0)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Median Transaction</span>
                        <span className="font-medium">Rs.{analysis.timeAnalysis.medianTransactionSize.toFixed(0)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Highest Single</span>
                        <span className="font-medium text-red-600">Rs.{analysis.summary.highestExpense.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Lowest Single</span>
                        <span className="font-medium text-green-600">Rs.{analysis.summary.lowestExpense.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-sm border p-6 md:col-span-2">
                    <h4 className="text-sm font-medium text-gray-700 mb-4">Daily Spending Calendar</h4>
                    <div className="grid grid-cols-7 gap-2">
                      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                        <div key={day} className="text-center text-xs text-gray-500 py-2">{day}</div>
                      ))}
                      
                      {analysis.dailySpending.map((day) => {
                        const intensity = Math.min(day.amount / (analysis.summary.totalExpenses / analysis.summary.daysAnalyzed * 2), 1);
                        return (
                          <div
                            key={day.date}
                            className="aspect-square rounded-lg flex flex-col items-center justify-center text-xs border"
                            style={{
                              backgroundColor: `rgba(59, 130, 246, ${intensity * 0.3 + 0.1})`,
                              borderColor: `rgba(59, 130, 246, ${intensity})`,
                            }}
                            title={`${day.date}: Rs.${day.amount.toLocaleString()} (${day.count} transactions)`}
                          >
                            <span className="font-medium">{new Date(day.date).getDate()}</span>
                            {day.amount > 0 && (
                              <span className="text-[10px] text-gray-600">Rs.{(day.amount/1000).toFixed(1)}k</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    <div className="mt-4 flex items-center gap-4 text-xs text-gray-500">
                      <span>Less</span>
                      <div className="flex gap-1">
                        {[0.1, 0.3, 0.5, 0.7, 0.9].map((op) => (
                          <div
                            key={op}
                            className="w-4 h-4 rounded"
                            style={{ backgroundColor: `rgba(59, 130, 246, ${op})` }}
                          />
                        ))}
                      </div>
                      <span>More spending</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Detailed Report Tab */}
            {activeTab === 'report' && (
              <DetailedReportPanel 
                report={analysis.detailedReport}
                startDate={analysis.summary.startDate}
                endDate={analysis.summary.endDate}
              />
            )}

            {/* Transactions Tab */}
            {activeTab === 'transactions' && (
              <div className="space-y-8">
                <TransactionsList transactions={analysis.transactions} />
              </div>
            )}
          </div>
        )}

        {/* Empty State */}
        {!analysis && !loading && !error && (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-100 mb-4">
              <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900">No statement analyzed yet</h3>
            <p className="mt-2 text-gray-500">Upload your HDFC bank statement (XLS/XLSX) to get started</p>
            
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
              <div className="p-4 bg-white rounded-lg shadow-sm border">
                <div className="text-2xl mb-2">📊</div>
                <p className="font-medium text-gray-900">Visual Analytics</p>
                <p className="text-sm text-gray-500">Charts and graphs of your spending</p>
              </div>
              <div className="p-4 bg-white rounded-lg shadow-sm border">
                <div className="text-2xl mb-2">⏰</div>
                <p className="font-medium text-gray-900">Time Analysis</p>
                <p className="text-sm text-gray-500">Patterns by day, week, weekend</p>
              </div>
              <div className="p-4 bg-white rounded-lg shadow-sm border">
                <div className="text-2xl mb-2">📄</div>
                <p className="font-medium text-gray-900">Detailed Report</p>
                <p className="text-sm text-gray-500">Insights and recommendations</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
