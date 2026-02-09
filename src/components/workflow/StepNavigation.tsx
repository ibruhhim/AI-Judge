/**
 * Step Navigation Component
 * 
 * Displays the workflow step progress indicator at the top of the workflow.
 */

interface Step {
  id: string;
  label: string;
  number: number;
  path: string;
}

interface StepNavigationProps {
  steps: readonly Step[];
  currentStep: string;
  currentStepIndex: number;
}

function StepNavigation({ steps, currentStep, currentStepIndex }: StepNavigationProps) {
  return (
    <nav className="mb-8">
      <div className="glass rounded-2xl p-2 flex items-center justify-between">
        {steps.map((step, index) => {
          const isActive = currentStep === step.id;
          const isCompleted = index < currentStepIndex;

          return (
            <div key={step.id} className="flex items-center flex-1">
              <div
                className={`flex-1 flex items-center justify-center space-x-3 px-6 py-4 rounded-xl transition-smooth ${
                  isActive
                    ? 'bg-secondary text-primary shadow-lg'
                    : isCompleted
                    ? 'text-text-secondary'
                    : 'text-text-tertiary'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                    isActive
                      ? 'bg-primary text-secondary'
                      : isCompleted
                      ? 'bg-bg-tertiary text-secondary'
                      : 'bg-bg-tertiary text-text-tertiary'
                  }`}
                >
                  {isCompleted && !isActive ? '✓' : step.number}
                </div>
                <span className="font-semibold hidden sm:block">{step.label}</span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`h-0.5 w-full mx-2 ${
                    isCompleted ? 'bg-text-secondary' : 'bg-bg-tertiary'
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </nav>
  );
}

export default StepNavigation;
