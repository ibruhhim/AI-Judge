/**
 * Workspace Naming Dialog Component
 * 
 * Modal dialog that appears after results are shown for a new workspace.
 * Allows users to name and save their workspace.
 */

import { useState } from 'react';

interface WorkspaceNamingDialogProps {
  currentWorkspaceId: string;
  onSave: (workspaceName: string) => void;
  onSkip: () => void;
}

function WorkspaceNamingDialog({ currentWorkspaceId, onSave, onSkip }: WorkspaceNamingDialogProps) {
  const [workspaceName, setWorkspaceName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSave = async () => {
    // Clear previous errors
    setError(null);
    setValidationError(null);

    // Validate input
    const trimmedName = workspaceName.trim();
    if (!trimmedName) {
      setValidationError('Please enter a workspace name');
      return;
    }

    if (trimmedName.length < 3) {
      setValidationError('Workspace name must be at least 3 characters long');
      return;
    }

    if (trimmedName.length > 100) {
      setValidationError('Workspace name must be less than 100 characters');
      return;
    }

    setIsSaving(true);
    try {
      await onSave(trimmedName);
    } catch (err) {
      console.error('Failed to save workspace name:', err);
      setError('Failed to save workspace name. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-overlay backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="glass rounded-3xl p-8 shadow-2xl max-w-md w-full">
        <h3 className="text-3xl font-bold mb-2 gradient-text">Name Your Workspace</h3>
        <p className="text-text-tertiary mb-6">
          Give your workspace a name to save it. If you skip, this workspace and all its data will be deleted.
        </p>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-text-secondary mb-2">
              Workspace Name
            </label>
            <input
              type="text"
              value={workspaceName}
              onChange={(e) => {
                setWorkspaceName(e.target.value);
                // Clear validation error when user starts typing
                if (validationError) {
                  setValidationError(null);
                }
              }}
              placeholder="e.g., Project Alpha, Test Run 1"
              className={`w-full px-4 py-3 glass-dark rounded-xl text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-2 focus:ring-orange transition-smooth ${
                validationError
                  ? 'border border-red-500 focus:ring-red-500'
                  : 'focus:ring-white focus:border-transparent'
              }`}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter' && workspaceName.trim()) {
                  handleSave();
                }
              }}
            />
            {validationError && (
              <p className="mt-2 text-sm text-red-400 flex items-center space-x-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span>{validationError}</span>
              </p>
            )}
            {error && (
              <p className="mt-2 text-sm text-red-400 flex items-center space-x-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span>{error}</span>
              </p>
            )}
          </div>

          <div className="flex space-x-3 pt-2">
            <button
              onClick={handleSave}
              disabled={isSaving || !workspaceName.trim()}
              className="flex-1 px-6 py-3 bg-button-bg hover:bg-button-bg-hover text-button-text rounded-xl font-semibold transition-smooth shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-button-bg"
            >
              {isSaving ? 'Saving...' : 'Save Workspace'}
            </button>
            <button
              onClick={onSkip}
              disabled={isSaving}
              className="px-6 py-3 glass-dark hover:bg-glass-dark text-text-primary rounded-xl font-semibold transition-smooth disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Skip
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WorkspaceNamingDialog;
