/**
 * Palm Tree Logo Component
 * 
 * SVG logo of a palm tree for the Judge.ai brand
 */

interface PalmTreeLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

function PalmTreeLogo({ size = 'md', className = '' }: PalmTreeLogoProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
  };

  return (
    <svg
      className={`${sizeClasses[size]} ${className}`}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Trunk */}
      <rect
        x="45"
        y="60"
        width="10"
        height="35"
        fill="#8b5a3c"
        stroke="#6b4423"
        strokeWidth="1"
      />
      
      {/* Trunk texture lines */}
      <line
        x1="47"
        y1="65"
        x2="47"
        y2="95"
        stroke="#6b4423"
        strokeWidth="0.5"
        opacity="0.6"
      />
      <line
        x1="50"
        y1="65"
        x2="50"
        y2="95"
        stroke="#6b4423"
        strokeWidth="0.5"
        opacity="0.6"
      />
      <line
        x1="53"
        y1="65"
        x2="53"
        y2="95"
        stroke="#6b4423"
        strokeWidth="0.5"
        opacity="0.6"
      />
      
      {/* Palm fronds - left side */}
      <path
        d="M 50 60 Q 30 50 20 45 Q 15 40 20 35 Q 25 30 30 35"
        fill="#15803d"
        stroke="#14532d"
        strokeWidth="1"
      />
      <path
        d="M 50 60 Q 25 55 15 50 Q 10 45 15 40 Q 20 35 25 40"
        fill="#15803d"
        stroke="#14532d"
        strokeWidth="1"
      />
      
      {/* Palm fronds - right side */}
      <path
        d="M 50 60 Q 70 50 80 45 Q 85 40 80 35 Q 75 30 70 35"
        fill="#15803d"
        stroke="#14532d"
        strokeWidth="1"
      />
      <path
        d="M 50 60 Q 75 55 85 50 Q 90 45 85 40 Q 80 35 75 40"
        fill="#15803d"
        stroke="#14532d"
        strokeWidth="1"
      />
      
      {/* Palm fronds - top */}
      <path
        d="M 50 60 Q 50 40 45 25 Q 40 15 45 20 Q 50 25 55 20 Q 60 15 55 25 Q 50 40 50 60"
        fill="#15803d"
        stroke="#14532d"
        strokeWidth="1"
      />
      
      {/* Palm fronds - center left */}
      <path
        d="M 50 60 Q 40 50 35 40 Q 30 35 35 30 Q 40 25 45 30"
        fill="#15803d"
        stroke="#14532d"
        strokeWidth="1"
      />
      
      {/* Palm fronds - center right */}
      <path
        d="M 50 60 Q 60 50 65 40 Q 70 35 65 30 Q 60 25 55 30"
        fill="#15803d"
        stroke="#14532d"
        strokeWidth="1"
      />
    </svg>
  );
}

export default PalmTreeLogo;
