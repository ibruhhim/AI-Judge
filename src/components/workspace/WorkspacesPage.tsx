/**
 * Workspaces Page Component
 * 
 * Displays all user workspaces with the ability to create, select, and delete workspaces
 */

import { useState, useEffect } from 'react';
import { Workspace } from '../../types/database';
import { getAllUserWorkspaces, deleteWorkspace } from '../../services/workspaceManagementService';
import WorkspacesList from './WorkspacesList';
import ErrorMessage from '../shared/ErrorMessage';
import ConfirmDialog from '../shared/ConfirmDialog';
import Button from '../shared/Button';

interface WorkspacesPageProps {
  onSelectWorkspace: (workspaceId: string) => void;
  onStartNewProcess: () => void;
}

function WorkspacesPage({ onSelectWorkspace, onStartNewProcess }: WorkspacesPageProps) {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; name: string } | null>(null);

  useEffect(() => {
    loadWorkspaces();
  }, []);

  const loadWorkspaces = async () => {
    setIsLoading(true);
    try {
      const data = await getAllUserWorkspaces();
      setWorkspaces(data);
    } catch (err) {
      console.error('Failed to load workspaces:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteWorkspace = async (workspaceId: string, workspaceName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteConfirm({ id: workspaceId, name: workspaceName });
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;

    try {
      await deleteWorkspace(deleteConfirm.id);
      setDeleteConfirm(null);
      setError(null);
      await loadWorkspaces();
    } catch (err) {
      console.error('Failed to delete workspace:', err);
      setError('Failed to delete workspace. Please try again.');
    }
  };

  return (
    <div className="min-h-screen pb-24 m-10">
      {error && (
        <ErrorMessage message={error} onDismiss={() => setError(null)} />
      )}

      <div className="glass rounded-3xl p-8 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold mb-2 gradient-text">Your Workspaces</h2>
            <p className="text-text-tertiary">Select a workspace to continue working, or create a new one</p>
          </div>
          <Button
            onClick={onStartNewProcess}
            variant="primary"
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            }
          >
            Create Workspace
          </Button>
        </div>

        <WorkspacesList
          workspaces={workspaces}
          isLoading={isLoading}
          onSelectWorkspace={onSelectWorkspace}
          onDeleteWorkspace={handleDeleteWorkspace}
        />
      </div>

      <ConfirmDialog
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={confirmDelete}
        title="Delete Workspace?"
        message={
          <>
            Are you sure you want to delete <span className="font-semibold">"{deleteConfirm?.name}"</span>? This will delete all submissions, questions, answers, and evaluations in this workspace. This action cannot be undone.
          </>
        }
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  );
}

export default WorkspacesPage;
