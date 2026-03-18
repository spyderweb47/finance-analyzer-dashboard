interface InsightsPanelProps {
  insights: string[];
}

export default function InsightsPanel({ insights }: InsightsPanelProps) {
  return (
    <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl shadow-sm p-6 text-white">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        Insights
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {insights.map((insight, index) => (
          <div key={index} className="flex items-start gap-3 bg-white/10 rounded-lg p-4">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-white/20 text-xs font-medium flex items-center justify-center">
              {index + 1}
            </span>
            <p className="text-sm text-white/90">{insight}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
