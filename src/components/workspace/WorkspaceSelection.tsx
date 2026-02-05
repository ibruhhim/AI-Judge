/**
 * Workspace Selection Component
 * 
 * Main page that allows users to:
 * - View all their existing workspaces
 * - Select a workspace to work with
 * - Create a new workspace (starts new workflow)
 */

import { useState, useEffect } from 'react';
import { Workspace } from '../../types/database';
import { getAllUserWorkspaces, deleteWorkspace } from '../../services/workspaceManagementService';

interface WorkspaceSelectionProps {
  onSelectWorkspace: (workspaceId: string) => void;
  onCreateNew: () => void;
}

function WorkspaceSelection({ onSelectWorkspace, onCreateNew }: WorkspaceSelectionProps) {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; name: string } | null>(null);

  useEffect(() => {
    loadWorkspaces();
  }, []);

  /**
   * Loads all workspaces for the current user
   */
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

  /**
   * Handles workspace deletion with confirmation
   */
  const handleDeleteWorkspace = async (workspaceId: string, workspaceName: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent selecting the workspace when clicking delete
    setDeleteConfirm({ id: workspaceId, name: workspaceName });
  };

  /**
   * Confirms and executes workspace deletion
   */
  const confirmDelete = async () => {
    if (!deleteConfirm) return;

    try {
      await deleteWorkspace(deleteConfirm.id);
      setWorkspaces(workspaces.filter((w) => w.id !== deleteConfirm.id));
      setDeleteConfirm(null);
      setError(null);
    } catch (err) {
      console.error('Failed to delete workspace:', err);
      setError('Failed to delete workspace. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="glass rounded-3xl p-12 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
          <p className="text-text-tertiary">Loading workspaces...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Error Message */}
      {error && (
        <div className="p-4 bg-danger-bg border border-danger rounded-xl text-danger backdrop-blur-sm">
          <div className="flex items-center space-x-2">
            <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span className="text-sm flex-1">{error}</span>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-red-300 hover:text-red-200"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      )}

      <div className="glass rounded-3xl p-8 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-4xl font-bold mb-2 gradient-text">Your Workspaces</h2>
            <p className="text-gray-400">Select a workspace to work with or create a new one</p>
          </div>
          <button
            onClick={onCreateNew}
            className="px-6 py-3 bg-white hover:bg-gray-100 text-black rounded-xl font-semibold transition-smooth shadow-lg"
          >
            + New Workspace
          </button>
        </div>

        {workspaces.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-text-secondary text-lg mb-2">No workspaces yet</p>
            <p className="text-text-tertiary text-sm mb-6">Create your first workspace to get started</p>
            <button
              onClick={onCreateNew}
              className="px-6 py-3 bg-button-bg hover:bg-button-bg-hover text-button-text rounded-xl font-semibold transition-smooth shadow-lg"
            >
              Create Workspace
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {workspaces.map((workspace) => (
              <div
                key={workspace.id}
                onClick={() => onSelectWorkspace(workspace.id)}
                className="glass-dark rounded-2xl p-6 cursor-pointer hover:bg-glass-dark transition-smooth hover:scale-105 hover:shadow-xl relative group"
              >
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-xl font-semibold text-text-primary flex-1">{workspace.name}</h3>
                  <button
                    onClick={(e) => handleDeleteWorkspace(workspace.id, workspace.name, e)}
                    className="opacity-0 group-hover:opacity-100 p-2 rounded-lg hover:bg-danger-bg text-text-tertiary hover:text-danger transition-smooth"
                    title="Delete workspace"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
                <p className="text-sm text-text-tertiary">
                  Created {new Date(workspace.created_at).toLocaleDateString()}
                </p>
                <div className="mt-4 flex items-center text-sm text-text-secondary">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  <span>Click to open</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-overlay backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass rounded-3xl p-8 shadow-2xl max-w-md w-full">
            <h3 className="text-2xl font-bold mb-4 text-text-primary">Delete Workspace?</h3>
            <p className="text-text-secondary mb-6">
              Are you sure you want to delete <span className="font-semibold">"{deleteConfirm.name}"</span>? This will delete all submissions, questions, answers, and evaluations in this workspace. This action cannot be undone.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={confirmDelete}
                className="flex-1 px-6 py-3 bg-danger hover:bg-danger-hover text-button-text rounded-xl font-semibold transition-smooth"
              >
                Delete
              </button>
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-6 py-3 glass-dark hover:bg-glass-dark text-text-primary rounded-xl font-semibold transition-smooth"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default WorkspaceSelection;
