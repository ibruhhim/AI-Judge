/**
 * Bottom Navigation Component
 * 
 * Displays navigation controls at the bottom of the workflow screen.
 * Includes Previous/Next buttons, GPT-5 warning, and Finish button.
 */

import { useTheme } from '../../contexts/ThemeContext';
import RunEvaluationsButton from '../shared/RunEvaluationsButton';

interface Step {
  id: string;
  label: string;
  number: number;
  path: string;
}

interface BottomNavigationProps {
  currentStep: string;
  currentStepIndex: number;
  steps: readonly Step[];
  stepCompletion: {
    upload: boolean;
    judges: boolean;
    assign: boolean;
    results: boolean;
  };
  workspaceId: string | null;
  hasGPT5Warning: boolean;
  onFinish: () => void;
  onStepComplete: (step: 'assign') => void;
  onNavigate: (path: string) => void;
}

function BottomNavigation({
  currentStep,
  currentStepIndex,
  steps,
  stepCompletion,
  workspaceId,
  hasGPT5Warning,
  onFinish,
  onStepComplete,
  onNavigate,
}: BottomNavigationProps) {
  const { theme } = useTheme();

  return (
    <div className="fixed bottom-0 left-0 right-0 glass border-t border-glass p-4 z-40">
      <div className="max-w-7xl mx-auto">
        {/* GPT-5 Warning */}
        {hasGPT5Warning && currentStep === 'judges' && (
          <div className="mb-3 p-3 rounded-xl animate-fade-in" style={{ backgroundColor: 'rgba(255, 107, 53, 0.2)', border: '2px solid rgba(255, 107, 53, 0.6)' }}>
            <div className="flex items-start space-x-2">
              <svg
                className="w-5 h-5 shrink-0 mt-0.5"
                fill="currentColor"
                viewBox="0 0 20 20"
                style={{ color: '#ff6b35' }}
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              <div className="flex-1">
                <p className="text-sm font-bold mb-0.5" style={{ color: '#ff6b35' }}>
                  ⚠️ Longer Wait Times Expected
                </p>
                <p className="text-xs leading-tight" style={{ color: 'var(--text-primary)' }}>
                  Selected judge(s) use GPT-5 models which have significantly longer response times (3-5 minutes per request). The evaluation process may take much longer than usual.
                </p>
              </div>
            </div>
          </div>
        )}
        <div className="flex items-center justify-between">
          {currentStep !== 'upload' && (
            <button
              onClick={() => {
                if (currentStepIndex > 0) {
                  onNavigate(steps[currentStepIndex - 1].path);
                }
              }}
              className="px-6 py-3 rounded-xl font-semibold transition-smooth glass-dark hover:bg-glass-dark text-text-primary"
            >
              <span className="flex items-center space-x-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span>Previous</span>
              </span>
            </button>
          )}

          <div className="flex items-center space-x-4 ml-auto">
            {currentStep === 'results' ? (
              <button
                onClick={onFinish}
                className="px-6 py-3 rounded-xl font-semibold transition-smooth bg-button-bg hover:bg-button-bg-hover text-button-text shadow-lg"
                style={theme === 'dark' ? {
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5), 0 0 15px rgba(255, 107, 53, 0.4), 0 0 30px rgba(255, 107, 53, 0.2)',
                } : {}}
              >
                <span className="flex items-center space-x-2">
                  <span>Finish</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </span>
              </button>
            ) : (
              currentStep === 'assign' ? (
                <RunEvaluationsButton
                  workspaceId={workspaceId}
                  buttonText="Run Evaluations"
                  size="lg"
                  resultsPath="/workflow/results"
                  onComplete={() => {
                    onStepComplete('assign');
                  }}
                />
              ) : (
                <button
                  onClick={() => {
                    const canProceed = 
                      (currentStep === 'upload' && stepCompletion.upload) ||
                      (currentStep === 'judges' && stepCompletion.judges);
                    
                    if (!canProceed || currentStepIndex >= steps.length - 1) {
                      return;
                    }

                    onNavigate(steps[currentStepIndex + 1].path);
                  }}
                  disabled={
                    (currentStep === 'upload' && !stepCompletion.upload) ||
                    (currentStep === 'judges' && !stepCompletion.judges)
                  }
                  className={`px-6 py-3 rounded-xl font-semibold transition-smooth ${
                    (currentStep === 'upload' && !stepCompletion.upload) ||
                      (currentStep === 'judges' && !stepCompletion.judges)
                        ? 'bg-bg-tertiary text-text-disabled cursor-not-allowed'
                        : 'bg-button-bg hover:bg-button-bg-hover text-button-text shadow-lg'
                    }`}
                    style={((currentStep === 'upload' && stepCompletion.upload) ||
                      (currentStep === 'judges' && stepCompletion.judges)) && theme === 'dark' ? {
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5), 0 0 15px rgba(255, 107, 53, 0.4), 0 0 30px rgba(255, 107, 53, 0.2)',
                    } : {}}
                >
                  <span className="flex items-center space-x-2">
                    <span>Next</span>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                </button>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default BottomNavigation;
