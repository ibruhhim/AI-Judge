/**
 * Evaluation Example Component
 * 
 * Shows a Discord-style chat conversation of an AI judge evaluating a submission
 */

import { useTheme } from '../../contexts/ThemeContext';

interface EvaluationExampleProps {
  className?: string;
}

function EvaluationExample({ className = '' }: EvaluationExampleProps) {
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';
  return (
    <div className={`space-y-4 ${className}`}>
      {/* Question Message - Right Side */}
      <div className="flex items-start justify-end space-x-3 animate-slide-in-right">
        <div className="flex-1 max-w-[75%]">
          <div className="flex items-center justify-end space-x-2 mb-1">
            <span className="text-xs text-text-tertiary">sub_002 • queue_1</span>
            <span className="font-semibold text-text-primary">Question</span>
          </div>
          <div 
            className="glass rounded-2xl p-4 shadow-2xl hover-scale transition-smooth relative"
            style={{
              transform: 'perspective(1000px) rotateY(-2deg)',
              boxShadow: isDarkMode 
                ? '0 10px 30px rgba(0, 0, 0, 0.2), 0 0 20px rgba(59, 130, 246, 0.2), 0 0 40px rgba(255, 107, 53, 0.4), 0 0 60px rgba(255, 107, 53, 0.2)'
                : '0 10px 30px rgba(0, 0, 0, 0.1), 0 0 20px rgba(59, 130, 246, 0.1)',
            }}
          >
            <p className="text-text-primary mb-2">
              <span className="font-semibold text-orange">Question Type:</span> <span className="text-sm text-text-tertiary ml-2">single_choice_with_reasoning</span>
            </p>
            <p className="text-text-primary font-medium">
              Is 17 a prime number?
            </p>
          </div>
        </div>
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0 shadow-lg">
          <span className="text-white font-bold text-sm">Q</span>
        </div>
      </div>

      {/* Answer Message - Left Side */}
      <div className="flex items-start space-x-3 animate-slide-in-left">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-lg">
          <span className="text-white font-bold text-sm">A</span>
        </div>
        <div className="flex-1 max-w-[75%]">
          <div className="flex items-center space-x-2 mb-1">
            <span className="font-semibold text-text-primary">Answer</span>
            <span className="text-xs text-text-tertiary">sub_002</span>
          </div>
          <div 
            className="glass-dark rounded-2xl p-4 shadow-2xl hover-scale transition-smooth relative"
            style={{
              transform: 'perspective(1000px) rotateY(2deg)',
              boxShadow: isDarkMode
                ? '0 10px 30px rgba(0, 0, 0, 0.2), 0 0 20px rgba(147, 51, 234, 0.2), 0 0 40px rgba(34, 197, 94, 0.4), 0 0 60px rgba(34, 197, 94, 0.2)'
                : '0 10px 30px rgba(0, 0, 0, 0.1), 0 0 20px rgba(147, 51, 234, 0.1)',
            }}
          >
            <div className="space-y-2">
              <div>
                <span className="text-sm font-semibold text-text-secondary">Choice:</span>
                <span className="ml-2 px-2 py-1 rounded bg-bg-tertiary text-text-primary font-medium">no</span>
              </div>
              <div>
                <span className="text-sm font-semibold text-text-secondary">Reasoning:</span>
                <p className="mt-1 text-text-secondary">It can be divided by 3.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Judge Evaluation Message - Right Side with FAIL */}
      <div className="flex items-start justify-end space-x-3 animate-slide-in-right">
        <div className="flex-1 max-w-[75%]">
          <div className="flex items-center justify-end space-x-2 mb-1">
            <span className="text-xs text-text-tertiary">Technical Accuracy • GPT-4</span>
            <span className="font-semibold text-text-primary">AI Judge</span>
          </div>
          <div 
            className="glass rounded-2xl p-4 shadow-2xl border-l-4 border-red-500 relative overflow-hidden hover-scale transition-smooth"
            style={{
              transform: 'perspective(1000px) rotateY(-2deg)',
              boxShadow: isDarkMode
                ? '0 10px 30px rgba(0, 0, 0, 0.3), 0 0 30px rgba(239, 68, 68, 0.4), 0 0 50px rgba(255, 107, 53, 0.5), 0 0 70px rgba(255, 107, 53, 0.3)'
                : '0 10px 30px rgba(0, 0, 0, 0.15), 0 0 20px rgba(239, 68, 68, 0.2)',
            }}
          >
            {/* Animated background effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 via-transparent to-transparent opacity-50"></div>
            
            <div className="relative z-10">
              {/* FAIL Badge */}
              <div className="flex items-center justify-end space-x-2 mb-3">
                <div className="flex items-center space-x-1">
                  <svg className="w-5 h-5 text-red-500 animate-bounce" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="px-4 py-2 rounded-lg text-lg font-black text-white bg-gradient-to-r from-red-600 to-red-700 shadow-lg transform hover:scale-110 transition-smooth">
                  FAIL
                </span>
              </div>
              
              <div className="space-y-2 text-sm text-text-secondary">
                <p>
                  <span className="font-semibold text-text-primary">Reasoning:</span> The answer is mathematically incorrect. 17 is indeed a prime number (divisible only by 1 and itself). The claim that "it can be divided by 3" is false, as 17 ÷ 3 = 5.67, not a whole number.
                </p>
                
                <div className="pl-3 border-l-2 border-red-500/30 mt-2">
                  <p className="font-semibold text-text-primary mb-1 text-xs uppercase tracking-wide">Issues Found:</p>
                  <ul className="space-y-1 text-text-secondary text-xs">
                    <li className="flex items-center space-x-2">
                      <svg className="w-3 h-3 text-red-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                      <span>Incorrect mathematical fact (17 is prime)</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <svg className="w-3 h-3 text-red-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                      <span>Faulty reasoning (17 ÷ 3 ≠ whole number)</span>
                    </li>
                  </ul>
                </div>
                
                <p className="pt-2 text-xs">
                  <span className="font-semibold text-text-primary">Verdict:</span> <span className="text-red-500 font-semibold">FAIL</span> — Answer demonstrates incorrect understanding of prime numbers.
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center flex-shrink-0 shadow-lg animate-pulse">
          <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
          </svg>
        </div>
      </div>
    </div>
  );
}

export default EvaluationExample;
