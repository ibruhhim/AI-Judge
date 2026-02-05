/**
 * Results Stats Component
 * 
 * Displays evaluation statistics in a dashboard format:
 * - Total number of evaluations
 * - Pass rate percentage
 * - Count of passed evaluations
 */

interface ResultsStatsProps {
  total: number;
  passRate: number;
  passed: number;
}

function ResultsStats({ total, passRate, passed }: ResultsStatsProps) {
  return (
    <div className="glass rounded-3xl p-8 shadow-2xl">
      <h2 className="text-4xl font-bold mb-2 gradient-text">Evaluation Statistics</h2>
      <p className="text-text-tertiary mb-6">Overview of your AI judge evaluations</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-dark rounded-2xl p-6 border border-glass hover:border-glass-light transition-smooth">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-semibold text-text-tertiary uppercase tracking-wider">Total Evaluations</div>
            <div className="w-10 h-10 rounded-lg bg-button-bg text-button-text flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
          <div className="text-4xl font-bold text-text-primary">{total}</div>
        </div>
        <div className="glass-dark rounded-2xl p-6 border border-glass hover:border-glass-light transition-smooth">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-semibold text-text-tertiary uppercase tracking-wider">Pass Rate</div>
            <div className="w-10 h-10 rounded-lg bg-button-bg text-button-text flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="text-4xl font-bold text-text-primary">
            {passRate.toFixed(1)}%
          </div>
        </div>
        <div className="glass-dark rounded-2xl p-6 border border-glass hover:border-glass-light transition-smooth">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-semibold text-text-tertiary uppercase tracking-wider">Passed</div>
            <div className="w-10 h-10 rounded-lg bg-button-bg text-button-text flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          <div className="text-4xl font-bold text-text-primary">{passed}</div>
        </div>
      </div>
    </div>
  );
}

export default ResultsStats;
