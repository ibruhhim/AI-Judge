/**
 * Back Button Component
 * 
 * Reusable back button for navigating to workspace overview
 */

import { useNavigate } from 'react-router-dom';

interface BackButtonProps {
  workspaceId: string;
  label?: string;
}

function BackButton({ workspaceId, label = 'Back to Overview' }: BackButtonProps) {
  const navigate = useNavigate();

  return (
    <div className="mb-4">
      <button
        onClick={() => navigate(`/workspace/${workspaceId}`)}
        className="flex items-center space-x-2 text-gray-300 hover:text-white transition-smooth"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        <span>{label}</span>
      </button>
    </div>
  );
}

export default BackButton;
