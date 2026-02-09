/**
 * Workspace View Component
 * 
 * Main workspace interface where users can:
 * - Upload/edit data
 * - Configure judges
 * - Assign judges to questions
 * - Run evaluations
 * - View results
 * 
 * This is a flexible workspace where users can perform actions in any order.
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import UploadStep from '../workflow/UploadStep';
import JudgesStep from '../workflow/JudgesStep';
import AssignStep from '../workflow/AssignStep';
import ResultsStep from '../workflow/ResultsStep';
import WorkspaceNamingDialog from './WorkspaceNamingDialog';
import { supabase, getCurrentUserId } from '../../lib/supabase';
import { updateWorkspaceName } from '../../services/workspaceManagementService';
import { Workspace } from '../../types/database';

interface WorkspaceViewProps {
  workspaceId: string;
  viewMode: string;
  onBack: () => void;
  showNamingOnLoad?: boolean; // If true, show naming dialog when results are first loaded
}

type ViewMode = 'overview' | 'upload' | 'judges' | 'assign' | 'results';

function WorkspaceView({ workspaceId, viewMode: viewModeParam, onBack, showNamingOnLoad = false }: WorkspaceViewProps) {
  const navigate = useNavigate();
  const viewMode = (viewModeParam || 'overview') as ViewMode;
  const [isRunningEvaluations, setIsRunningEvaluations] = useState(false);
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [showNamingDialog, setShowNamingDialog] = useState(false);
  const [hasCheckedNaming, setHasCheckedNaming] = useState(false);
  const [showRenameDialog, setShowRenameDialog] = useState(false);
  const [renameError, setRenameError] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  // Reset naming check when workspace changes
  useEffect(() => {
    setHasCheckedNaming(false);
    setShowNamingDialog(false);
  }, [workspaceId]);

  /**
   * Loads workspace information to check if it has a temporary name
   */
  useEffect(() => {
    if (workspaceId) {
      loadWorkspace();
    }
  }, [workspaceId]);

  /**
   * Loads workspace data
   */
  const loadWorkspace = async () => {
    try {
      const { data, error } = await supabase
        .from('workspaces')
        .select('*')
        .eq('id', workspaceId)
        .single();

      if (error) {
        console.error('Error loading workspace:', error);
        return;
      }

      setWorkspace(data);
    } catch (err) {
      console.error('Failed to load workspace:', err);
    }
  };


  /**
   * Handles saving workspace name
   */
  const handleSaveWorkspaceName = async (workspaceName: string) => {
    if (!workspaceId) return;
    
    try {
      await updateWorkspaceName(workspaceId, workspaceName);
      await loadWorkspace(); // Reload workspace to update name
      setShowNamingDialog(false);
    } catch (err) {
      console.error('Failed to save workspace name:', err);
      throw err;
    }
  };

  /**
   * Handles skipping workspace naming
   * If user skips, delete the workspace and all its data
   */
  const handleSkipNaming = async () => {
    if (!workspaceId) return;
    
    try {
      // Delete the workspace (cascade will delete all related data)
      const { error } = await supabase
        .from('workspaces')
        .delete()
        .eq('id', workspaceId);
      
      if (error) {
        throw error;
      }
      
      // Go back to workspace selection
      onBack();
    } catch (err) {
      console.error('Failed to delete workspace:', err);
      setError('Failed to delete workspace. Please try again.');
    }
  };

  /**
   * Handles renaming workspace
   */
  const handleRenameWorkspace = async (newName: string) => {
    if (!workspaceId) return;
    
    setRenameError(null);
    try {
      await updateWorkspaceName(workspaceId, newName);
      await loadWorkspace();
      setShowRenameDialog(false);
    } catch (err) {
      console.error('Failed to rename workspace:', err);
      setRenameError('Failed to rename workspace. Please try again.');
    }
  };

  /**
   * Handles running evaluations for the workspace
   */
  const handleRunEvaluations = async () => {
    setIsRunningEvaluations(true);
    try {
      const userId = getCurrentUserId();
      
      console.log('Starting evaluations for workspace:', workspaceId);
      
      // Add timeout to prevent infinite loading (5 minutes max)
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Evaluation timeout: The operation took too long. Please try again.')), 5 * 60 * 1000);
      });
      
      const evaluationPromise = supabase.functions.invoke('run-evaluations', {
        body: {
          workspaceId,
          userId,
        },
      });

      const { data, error: functionError } = await Promise.race([evaluationPromise, timeoutPromise]) as any;

      if (functionError) {
        console.error('Function error:', functionError);
        throw functionError;
      }

      if (data?.error) {
        console.error('Data error:', data.error);
        throw new Error(data.error);
      }

      console.log('Evaluations completed:', data);
      // Switch to results view after evaluations complete
      navigate(`/workspace/${workspaceId}/results`);
      // Reload workspace to check if it has temporary name
      await loadWorkspace();
    } catch (err) {
      console.error('Error running evaluations:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(`Failed to run evaluations: ${errorMessage}`);
    } finally {
      setIsRunningEvaluations(false);
    }
  };

  return (
    <main className="relative pb-24 page-transition">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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

      {/* Workspace Header - Only show in overview mode */}
      {viewMode === 'overview' && (
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
                    onClick={() => {
                      setRenameValue(workspace.name);
                      setRenameError(null);
                      setShowRenameDialog(true);
                    }}
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

          {/* Navigation Tabs */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
            <button
              onClick={() => navigate(`/workspace/${workspaceId}/upload`)}
              className="glass-dark rounded-2xl p-6 text-left hover:bg-glass-dark transition-smooth hover:scale-105"
            >
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-glass-dark flex items-center justify-center">
                  <svg className="w-6 h-6 text-text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-text-primary">Upload Data</h3>
              </div>
              <p className="text-text-tertiary text-sm">Import or update submissions</p>
            </button>

            <button
              onClick={() => navigate(`/workspace/${workspaceId}/judges`)}
              className="glass-dark rounded-2xl p-6 text-left hover:bg-glass-dark transition-smooth hover:scale-105"
            >
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-glass-dark flex items-center justify-center">
                  <svg className="w-6 h-6 text-text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-text-primary">Configure Judges</h3>
              </div>
              <p className="text-text-tertiary text-sm">Create and manage AI judges</p>
            </button>

            <button
              onClick={() => navigate(`/workspace/${workspaceId}/assign`)}
              className="glass-dark rounded-2xl p-6 text-left hover:bg-glass-dark transition-smooth hover:scale-105"
            >
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-glass-dark flex items-center justify-center">
                  <svg className="w-6 h-6 text-text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-text-primary">Assign Judges</h3>
              </div>
              <p className="text-text-tertiary text-sm">Assign judges to questions</p>
            </button>

            <button
              onClick={() => navigate(`/workspace/${workspaceId}/results`)}
              className="glass-dark rounded-2xl p-6 text-left hover:bg-glass-dark transition-smooth hover:scale-105"
            >
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-glass-dark flex items-center justify-center">
                  <svg className="w-6 h-6 text-text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-text-primary">View Results</h3>
              </div>
              <p className="text-text-tertiary text-sm">See evaluation results</p>
            </button>
          </div>
        </div>
      )}

      {/* Content Area */}
      {viewMode === 'upload' && (
        <div>
          <div className="mb-4">
            <button
              onClick={() => navigate(`/workspace/${workspaceId}`)}
              className="flex items-center space-x-2 text-gray-300 hover:text-white transition-smooth"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>Back to Overview</span>
            </button>
          </div>
          <UploadStep
            workspaceId={workspaceId}
            onComplete={(id) => {
              // Data uploaded successfully, go to overview
              navigate(`/workspace/${workspaceId}`);
            }}
          />
        </div>
      )}

      {viewMode === 'judges' && (
        <div>
          <div className="mb-4">
            <button
              onClick={() => navigate(`/workspace/${workspaceId}`)}
              className="flex items-center space-x-2 text-gray-300 hover:text-white transition-smooth"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>Back to Overview</span>
            </button>
          </div>
          <JudgesStep
            workspaceId={workspaceId}
            onComplete={() => {
              // Judges configured, can stay in judges view
            }}
          />
        </div>
      )}

      {viewMode === 'assign' && (
        <div>
          <div className="mb-4">
            <button
              onClick={() => navigate(`/workspace/${workspaceId}`)}
              className="flex items-center space-x-2 text-gray-300 hover:text-white transition-smooth"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>Back to Overview</span>
            </button>
          </div>
          <AssignStep
            workspaceId={workspaceId}
            onComplete={() => {
              // Assignments made, can stay in assign view
            }}
          />
        </div>
      )}

      {viewMode === 'results' && (
        <div>
          <div className="mb-4">
            <button
              onClick={() => navigate(`/workspace/${workspaceId}`)}
              className="flex items-center space-x-2 text-gray-300 hover:text-white transition-smooth"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>Back to Overview</span>
            </button>
          </div>
          <ResultsStep
            workspaceId={workspaceId}
            onBackToWorkspaces={onBack}
            onResultsLoaded={() => {
              // Only show naming dialog if we're coming from the workflow AND workspace has temporary name
              // For existing workspaces opened from landing page, showNamingOnLoad is false, so this won't trigger
              if (!showNamingOnLoad) {
                // Not coming from workflow, don't show dialog
                return;
              }
              
              // Only proceed if we haven't checked yet and workspace is loaded
              if (hasCheckedNaming || !workspace) {
                return;
              }
              
              // Only show if workspace is still temporary (unsaved)
              if (workspace.temporary && !showNamingDialog) {
                setShowNamingDialog(true);
                setHasCheckedNaming(true);
              }
            }}
            isInWorkflow={false} // We're in workspace view, not linear workflow
          />
        </div>
      )}

      {/* Workspace Naming Dialog (shown after results for workspaces with temporary names) */}
      {showNamingDialog && workspaceId && (
        <WorkspaceNamingDialog
          currentWorkspaceId={workspaceId}
          onSave={handleSaveWorkspaceName}
          onSkip={handleSkipNaming}
        />
      )}

      {/* Rename Workspace Dialog */}
      {showRenameDialog && workspace && (
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
                  onChange={(e) => {
                    setRenameValue(e.target.value);
                    if (renameError) setRenameError(null);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && renameValue.trim() && renameValue.trim() !== workspace.name) {
                      handleRenameWorkspace(renameValue.trim());
                    }
                  }}
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
                  onClick={() => {
                    if (renameValue.trim() && renameValue.trim() !== workspace.name) {
                      handleRenameWorkspace(renameValue.trim());
                    }
                  }}
                  disabled={!renameValue.trim() || renameValue.trim() === workspace.name}
                  className="flex-1 px-6 py-3 bg-button-bg hover:bg-button-bg-hover text-button-text rounded-xl font-semibold transition-smooth shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-button-bg"
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setShowRenameDialog(false);
                    setRenameError(null);
                    setRenameValue('');
                  }}
                  className="px-6 py-3 glass-dark hover:bg-glass-dark text-text-primary rounded-xl font-semibold transition-smooth"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
        </div>
      </div>
    </main>
  );
}

export default WorkspaceView;
