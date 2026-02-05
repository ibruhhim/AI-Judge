/**
 * Workspace Card Component
 * 
 * Displays a single workspace card with name, creation date, and delete action
 */

import { Workspace } from '../../types/database';

interface WorkspaceCardProps {
  workspace: Workspace;
  onSelect: (workspaceId: string) => void;
  onDelete: (workspaceId: string, workspaceName: string, e: React.MouseEvent) => void;
}

function WorkspaceCard({ workspace, onSelect, onDelete }: WorkspaceCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div
      onClick={() => onSelect(workspace.id)}
      className="glass-dark rounded-2xl p-6 cursor-pointer hover:bg-glass-dark transition-smooth hover-scale hover-lift group animate-slide-in-up"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-text-primary mb-1 group-hover:text-text-primary transition-smooth">
            {workspace.name}
          </h3>
          <p className="text-sm text-text-tertiary">
            Created {formatDate(workspace.created_at)}
          </p>
        </div>
        <button
          onClick={(e) => onDelete(workspace.id, workspace.name, e)}
          className="ml-2 p-2 text-text-tertiary hover:text-danger transition-smooth rounded-lg hover:bg-danger-bg"
          title="Delete workspace"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
      <div className="flex items-center space-x-2 text-text-secondary text-sm">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <span>Click to open</span>
      </div>
    </div>
  );
}

export default WorkspaceCard;
