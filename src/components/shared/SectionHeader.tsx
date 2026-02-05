/**
 * Section Header Component
 * 
 * Reusable section header with gradient text
 */

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  gradientText?: string;
  className?: string;
}

function SectionHeader({ title, subtitle, gradientText, className = '' }: SectionHeaderProps) {
  return (
    <div className={`text-center mb-16 ${className}`}>
      <h2 className="text-4xl md:text-5xl font-bold mb-4">
        {gradientText ? (
          <>
            <span className="gradient-text drop-shadow-glow-orange drop-shadow-glow-green">{gradientText}</span>
            <span className="text-text-primary"> {title}</span>
          </>
        ) : (
          <span className="gradient-text drop-shadow-glow-orange drop-shadow-glow-green">{title}</span>
        )}
      </h2>
      {subtitle && (
        <p className="text-xl text-text-secondary max-w-2xl mx-auto">
          {subtitle}
        </p>
      )}
    </div>
  );
}

export default SectionHeader;
