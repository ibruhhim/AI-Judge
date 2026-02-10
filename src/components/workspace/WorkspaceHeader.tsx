/**
 * Workspace Header Component
 * 
 * Displays workspace name, back button, and rename functionality
 */

import { useNavigate } from 'react-router-dom';
import { Workspace } from '../../types/database';

interface WorkspaceHeaderProps {
  workspace: Workspace | null;
  workspaceId: string;
  onRenameClick: () => void;
}

function WorkspaceHeader({ workspace, workspaceId, onRenameClick }: WorkspaceHeaderProps) {
  const navigate = useNavigate();

  return (
    <div className="glass rounded-3xl p-8 shadow-2xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <button
            onClick={() => navigate('/workspaces')}
            className="flex items-center space-x-2 text-text-secondary hover:text-text-primary transition-smooth mb-4"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Back to Workspaces</span>
          </button>
          <div className="flex items-center space-x-3 mb-2">
            <h2 className="text-4xl font-bold gradient-text">
              {workspace?.name || 'Workspace'}
            </h2>
            {workspace && (
              <button
                onClick={onRenameClick}
                className="p-2 text-text-tertiary hover:text-text-primary transition-smooth hover:bg-glass-dark rounded-lg"
                title="Rename workspace"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
            )}
          </div>
          <p className="text-text-tertiary">Manage your data, judges, and evaluations</p>
        </div>
      </div>
    </div>
  );
}

export default WorkspaceHeader;
