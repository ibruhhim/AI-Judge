/**
 * Loading Spinner Component
 * 
 * Reusable loading spinner with optional message
 */

interface LoadingSpinnerProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}

function LoadingSpinner({ message, size = 'md' }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-8 h-8 border-2',
    md: 'w-12 h-12 border-4',
    lg: 'w-16 h-16 border-4',
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      <div className={`${sizeClasses[size]} border-orange border-t-transparent rounded-full animate-spin`}></div>
      {message && <p className="text-text-tertiary">{message}</p>}
    </div>
  );
}

export default LoadingSpinner;
