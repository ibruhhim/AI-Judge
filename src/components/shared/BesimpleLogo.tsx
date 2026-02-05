/**
 * BeSimple AI Logo Component
 * 
 * Displays the BeSimple AI logo with gradient styling
 */

interface BesimpleLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

function BesimpleLogo({ className = '', size = 'md' }: BesimpleLogoProps) {
  const sizeClasses = {
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-3xl',
  };

  return (
    <div className={`font-bold ${sizeClasses[size]} ${className}`} style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <span 
        className="lowercase"
        style={{
          background: 'linear-gradient(to right, #fbbf24, #fb923c, #ea580c)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}
      >
        besimple
      </span>
      <span className="uppercase ml-2" style={{ color: '#ea580c' }}>AI</span>
    </div>
  );
}

export default BesimpleLogo;
