/**
 * Feature Card Component
 * 
 * Reusable feature card for landing pages
 */

import { ReactNode } from 'react';

interface FeatureCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  iconBgColor?: 'orange' | 'green';
}

function FeatureCard({ icon, title, description, iconBgColor = 'orange' }: FeatureCardProps) {
  const isOrange = iconBgColor === 'orange';
  const bgColorClass = isOrange ? 'bg-orange/20' : 'bg-green/20';
  const iconColorClass = isOrange ? 'text-orange' : 'text-green';
  const glowClass = isOrange ? 'shadow-glow-orange' : 'shadow-glow-green';
  const borderGradient = isOrange ? 'border-orange/30' : 'border-green/30';
  const borderIconClass = isOrange ? 'border-orange/30' : 'border-green/30';

  return (
    <div className={`relative glass rounded-3xl p-10 text-center hover-scale hover-lift transition-smooth ${glowClass} animate-slide-in-up overflow-hidden group`}>
      {/* Gradient border effect */}
      <div className={`absolute inset-0 rounded-3xl border-2 ${borderGradient} opacity-0 group-hover:opacity-100 transition-smooth pointer-events-none`}></div>
      
      {/* Decorative gradient overlay */}
      {isOrange ? (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-40 bg-orange/10 rounded-full blur-3xl opacity-40 group-hover:opacity-60 transition-smooth"></div>
      ) : (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-40 bg-green/10 rounded-full blur-3xl opacity-40 group-hover:opacity-60 transition-smooth"></div>
      )}
      
      <div className="relative z-10">
        {/* Icon container with enhanced styling */}
        <div className="relative inline-block mb-8">
          {isOrange ? (
            <div className="absolute inset-0 bg-orange/20 rounded-full blur-2xl group-hover:blur-3xl transition-smooth"></div>
          ) : (
            <div className="absolute inset-0 bg-green/20 rounded-full blur-2xl group-hover:blur-3xl transition-smooth"></div>
          )}
          <div className={`relative w-20 h-20 mx-auto rounded-2xl ${bgColorClass} flex items-center justify-center border-2 ${borderIconClass} shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-smooth`}>
            <div className={`${iconColorClass} transform group-hover:scale-110 transition-smooth`}>
              {icon}
            </div>
          </div>
        </div>
        
        <h3 className="text-2xl font-bold mb-4 text-text-primary group-hover:text-orange transition-smooth">{title}</h3>
        
        <div className="h-px w-16 mx-auto bg-gradient-to-r from-transparent via-glass to-transparent mb-4"></div>
        
        <p className="text-text-secondary leading-relaxed font-medium">{description}</p>
      </div>
    </div>
  );
}

export default FeatureCard;
