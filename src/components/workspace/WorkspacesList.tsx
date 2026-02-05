/**
 * Workspaces List Component
 * 
 * Displays a grid of workspace cards with loading and empty states
 */

import { Workspace } from '../../types/database';
import WorkspaceCard from './WorkspaceCard';
import LoadingSpinner from '../shared/LoadingSpinner';
import EmptyState from '../shared/EmptyState';

interface WorkspacesListProps {
  workspaces: Workspace[];
  isLoading: boolean;
  onSelectWorkspace: (workspaceId: string) => void;
  onDeleteWorkspace: (workspaceId: string, workspaceName: string, e: React.MouseEvent) => void;
}

function WorkspacesList({
  workspaces,
  isLoading,
  onSelectWorkspace,
  onDeleteWorkspace,
}: WorkspacesListProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner message="Loading workspaces..." />
      </div>
    );
  }

  if (workspaces.length === 0) {
    return (
      <EmptyState
        icon={
          <svg className="w-12 h-12 text-text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        }
        title="No workspaces yet"
        description="Create your first workspace to get started"
      />
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-stagger">
      {workspaces.map((workspace) => (
        <WorkspaceCard
          key={workspace.id}
          workspace={workspace}
          onSelect={onSelectWorkspace}
          onDelete={onDeleteWorkspace}
        />
      ))}
    </div>
  );
}

export default WorkspacesList;
