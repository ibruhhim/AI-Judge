/**
 * Empty State Component
 * 
 * Reusable empty state display
 */

import { ReactNode } from 'react';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="glass rounded-3xl p-12 text-center">
      {icon && (
        <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-glass-dark flex items-center justify-center">
          {icon}
        </div>
      )}
      <h3 className="text-xl font-semibold text-text-secondary mb-2">{title}</h3>
      {description && <p className="text-text-tertiary mb-6">{description}</p>}
      {action && <div>{action}</div>}
    </div>
  );
}

export default EmptyState;
