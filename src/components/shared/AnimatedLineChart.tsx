/**
 * Animated Line Chart Component
 * 
 * Shows animated stock-style line chart with zigzag effect representing evaluation percentages
 */

interface AnimatedLineChartProps {
  className?: string;
}

function AnimatedLineChart({ className = '' }: AnimatedLineChartProps) {
  // Create data points for the line chart (simulating evaluation results over time)
  const generateLineData = () => {
    const points = [];
    const baseValues = [45, 52, 48, 65, 70, 68, 75, 72, 78, 75]; // Simulated pass rates
    for (let i = 0; i < baseValues.length; i++) {
      points.push({
        x: (i / (baseValues.length - 1)) * 100,
        y: 100 - baseValues[i], // Invert for SVG coordinates
        value: baseValues[i],
      });
    }
    return points;
  };

  const lineData = generateLineData();
  const chartHeight = 300;
  const chartWidth = 100;

  // Create SVG path for the line with smooth zigzag
  const createPath = () => {
    let path = `M 0 ${chartHeight}`;
    lineData.forEach((point, index) => {
      const x = (point.x / 100) * 800; // Scale to container width
      const y = (point.y / 100) * chartHeight;
      if (index === 0) {
        path += ` L ${x} ${y}`;
      } else {
        // Create smooth zigzag effect between points
        const prevX = ((lineData[index - 1].x) / 100) * 800;
        const prevY = ((lineData[index - 1].y) / 100) * chartHeight;
        const midX = (prevX + x) / 2;
        const midY = (prevY + y) / 2 + (index % 2 === 0 ? -12 : 12); // Zigzag offset
        // Use quadratic curves for smoother transitions
        path += ` Q ${midX} ${midY} ${x} ${y}`;
      }
    });
    return path;
  };

  const path = createPath();

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="glass rounded-3xl p-8 shadow-2xl">
        <h3 className="text-2xl font-bold text-text-primary mb-6 text-center">Evaluation Results</h3>
        
        {/* Stock-style Line Chart */}
        <div className="relative mb-8 overflow-hidden" style={{ height: `${chartHeight + 60}px` }}>
          <svg 
            width="100%" 
            height={chartHeight} 
            viewBox={`0 0 800 ${chartHeight}`}
            className="overflow-visible"
            preserveAspectRatio="none"
            style={{ display: 'block' }}
          >
            {/* Grid lines */}
            <defs>
              <linearGradient id="lineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#22c55e" stopOpacity="1" />
                <stop offset="100%" stopColor="#16a34a" stopOpacity="0.6" />
              </linearGradient>
              <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#22c55e" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#16a34a" stopOpacity="0.1" />
              </linearGradient>
            </defs>
            
            {/* Grid lines */}
            {[0, 25, 50, 75, 100].map((y) => (
              <line
                key={y}
                x1="0"
                y1={(y / 100) * chartHeight}
                x2="800"
                y2={(y / 100) * chartHeight}
                stroke="rgba(255, 255, 255, 0.1)"
                strokeWidth="1"
                strokeDasharray="4 4"
              />
            ))}
            
            {/* Area under the line */}
            <path
              d={`${path} L 800 ${chartHeight} L 0 ${chartHeight} Z`}
              fill="url(#areaGradient)"
              className="animate-fade-in"
            />
            
            {/* Animated zigzag line */}
            <path
              d={path}
              fill="none"
              stroke="url(#lineGradient)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{
                filter: 'drop-shadow(0 0 8px rgba(34, 197, 94, 0.6))',
              }}
            />
            
            {/* Data points */}
            {lineData.map((point, index) => {
              const x = (point.x / 100) * 800;
              const y = (point.y / 100) * chartHeight;
              return (
                <g key={index}>
                  <circle
                    cx={x}
                    cy={y}
                    r="5"
                    fill="#22c55e"
                    stroke="#ffffff"
                    strokeWidth="2"
                    style={{
                      filter: 'drop-shadow(0 0 4px rgba(34, 197, 94, 0.8))',
                    }}
                  />
                </g>
              );
            })}
          </svg>
          
          {/* Y-axis labels */}
          <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-text-tertiary pointer-events-none" style={{ width: '40px' }}>
            <span>100%</span>
            <span>75%</span>
            <span>50%</span>
            <span>25%</span>
            <span>0%</span>
          </div>
          
          {/* Current value indicator */}
          <div className="absolute top-4 right-4 glass-dark rounded-lg px-4 py-2">
            <div className="text-sm text-text-tertiary mb-1">Current Pass Rate</div>
            <div className="text-2xl font-bold text-green">75%</div>
          </div>
        </div>
        
        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4 mt-8">
          <div className="glass-dark rounded-xl p-4 text-center">
            <div className="text-3xl font-bold text-green mb-1">75%</div>
            <div className="text-sm text-text-tertiary">Pass Rate</div>
          </div>
          <div className="glass-dark rounded-xl p-4 text-center">
            <div className="text-3xl font-bold text-orange mb-1">1,247</div>
            <div className="text-sm text-text-tertiary">Total Evaluations</div>
          </div>
          <div className="glass-dark rounded-xl p-4 text-center">
            <div className="text-3xl font-bold text-text-primary mb-1">42</div>
            <div className="text-sm text-text-tertiary">Active Judges</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AnimatedLineChart;
