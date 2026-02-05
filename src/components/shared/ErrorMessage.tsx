/**
 * Error Message Component
 * 
 * Reusable error message display
 */

interface ErrorMessageProps {
  message: string;
  onDismiss?: () => void;
}

function ErrorMessage({ message, onDismiss }: ErrorMessageProps) {
  return (
    <div className="p-4 bg-danger-bg border border-danger rounded-xl text-danger backdrop-blur-sm">
      <div className="flex items-center space-x-2">
        <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
        </svg>
        <span className="text-sm flex-1">{message}</span>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="text-danger hover:text-danger-hover transition-smooth"
            aria-label="Dismiss"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}

export default ErrorMessage;
