import { DetailedReport } from '../lib/analyzer';
import { format } from 'date-fns';

interface DetailedReportPanelProps {
  report: DetailedReport;
  startDate: Date;
  endDate: Date;
}

export default function DetailedReportPanel({ report, startDate, endDate }: DetailedReportPanelProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
      <div className="px-6 py-4 border-b bg-gradient-to-r from-gray-50 to-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Detailed Financial Report</h3>
            <p className="text-sm text-gray-500 mt-1">
              {format(startDate, 'dd MMM yyyy')} - {format(endDate, 'dd MMM yyyy')}
            </p>
          </div>
          <button 
            onClick={() => window.print()}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Print Report
          </button>
        </div>
      </div>

      <div className="p-6 space-y-8">
        {/* Executive Summary */}
        <section>
          <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs">01</span>
            Executive Summary
          </h4>
          <div className="bg-blue-50 rounded-lg p-4">
            <ul className="space-y-2">
              {report.executiveSummary.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                  <svg className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Spending Patterns */}
        <section>
          <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xs">02</span>
            Spending Patterns
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {report.spendingPatterns.map((item, idx) => (
              <div key={idx} className="bg-green-50 rounded-lg p-4 flex items-start gap-3">
                <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                </svg>
                <span className="text-sm text-gray-700">{item}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Unusual Activity */}
        <section>
          <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-yellow-100 text-yellow-600 flex items-center justify-center text-xs">03</span>
            Unusual Activity Detection
          </h4>
          <div className="bg-yellow-50 rounded-lg p-4">
            {report.unusualActivity.length > 0 ? (
              <ul className="space-y-2">
                {report.unusualActivity.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                    <svg className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-600">No unusual activity detected in this period.</p>
            )}
          </div>
        </section>

        {/* Recommendations */}
        <section>
          <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-xs">04</span>
            Recommendations
          </h4>
          <div className="space-y-3">
            {report.recommendations.length > 0 ? (
              report.recommendations.map((item, idx) => (
                <div key={idx} className="bg-purple-50 rounded-lg p-4 flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-purple-200 text-purple-700 flex items-center justify-center text-xs font-medium flex-shrink-0">
                    {idx + 1}
                  </span>
                  <span className="text-sm text-gray-700">{item}</span>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-600">Your spending patterns look healthy. Keep it up!</p>
            )}
          </div>
        </section>

        {/* Key Insights */}
        <section>
          <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center text-xs">05</span>
            Key Insights
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {report.topInsights.map((insight, idx) => (
              <div key={idx} className="bg-gray-50 rounded-lg p-4 border-l-4 border-primary-500">
                <p className="text-sm text-gray-700">{insight}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t bg-gray-50 text-center">
        <p className="text-xs text-gray-500">
          Report generated by Finance Analyzer on {format(new Date(), 'dd MMM yyyy')} at {format(new Date(), 'HH:mm')}
        </p>
      </div>
    </div>
  );
}
