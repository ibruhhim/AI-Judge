/**
 * Rename Workspace Dialog Component
 * 
 * Dialog for renaming a workspace
 */

import { Workspace } from '../../types/database';

interface RenameWorkspaceDialogProps {
  workspace: Workspace;
  renameValue: string;
  renameError: string | null;
  onRenameValueChange: (value: string) => void;
  onSave: () => void;
  onCancel: () => void;
}

function RenameWorkspaceDialog({
  workspace,
  renameValue,
  renameError,
  onRenameValueChange,
  onSave,
  onCancel,
}: RenameWorkspaceDialogProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && renameValue.trim() && renameValue.trim() !== workspace.name) {
      onSave();
    }
  };

  return (
    <div className="fixed inset-0 bg-overlay backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="glass rounded-3xl p-8 shadow-2xl max-w-md w-full">
        <h3 className="text-3xl font-bold mb-2 gradient-text">Rename Workspace</h3>
        <p className="text-gray-400 mb-6">
          Enter a new name for your workspace.
        </p>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Workspace Name
            </label>
            <input
              type="text"
              value={renameValue}
              onChange={(e) => onRenameValueChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter workspace name"
              className={`w-full px-4 py-3 glass-dark rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-smooth ${
                renameError
                  ? 'border border-red-500 focus:ring-red-500'
                  : 'focus:ring-white focus:border-transparent'
              }`}
              autoFocus
            />
            {renameError && (
              <p className="mt-2 text-sm text-red-400 flex items-center space-x-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span>{renameError}</span>
              </p>
            )}
          </div>

          <div className="flex space-x-3 pt-2">
            <button
              onClick={onSave}
              disabled={!renameValue.trim() || renameValue.trim() === workspace.name}
              className="flex-1 px-6 py-3 bg-button-bg hover:bg-button-bg-hover text-button-text rounded-xl font-semibold transition-smooth shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-button-bg"
            >
              Save
            </button>
            <button
              onClick={onCancel}
              className="px-6 py-3 glass-dark hover:bg-glass-dark text-text-primary rounded-xl font-semibold transition-smooth"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RenameWorkspaceDialog;
