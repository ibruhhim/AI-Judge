/**
 * Workspace View Page Component
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
import UploadStep from '../components/workflow/UploadStep';
import JudgesStep from '../components/workflow/JudgesStep';
import AssignStep from '../components/workflow/AssignStep';
import ResultsStep from '../components/workflow/ResultsStep';
import WorkspaceNamingDialog from '../components/workspace/WorkspaceNamingDialog';
import WorkspaceHeader from '../components/workspace/WorkspaceHeader';
import WorkspaceNavigationTabs from '../components/workspace/WorkspaceNavigationTabs';
import BackButton from '../components/workspace/BackButton';
import RenameWorkspaceDialog from '../components/workspace/RenameWorkspaceDialog';
import ErrorMessage from '../components/shared/ErrorMessage';
import { supabase } from '../lib/supabase';
import { updateWorkspaceName } from '../services/workspaceManagementService';
import { Workspace } from '../types/database';

interface WorkspaceViewPageProps {
  workspaceId: string;
  viewMode: string;
  onBack: () => void;
  showNamingOnLoad?: boolean; // If true, show naming dialog when results are first loaded
}

type ViewMode = 'overview' | 'upload' | 'judges' | 'assign' | 'results';

function WorkspaceViewPage({ workspaceId, viewMode: viewModeParam, onBack, showNamingOnLoad = false }: WorkspaceViewPageProps) {
  const navigate = useNavigate();
  const viewMode = (viewModeParam || 'overview') as ViewMode;
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


  return (
    <main className="relative pb-24 page-transition">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {error && (
            <ErrorMessage message={error} onDismiss={() => setError(null)} />
          )}

          {/* Workspace Header - Only show in overview mode */}
          {viewMode === 'overview' && (
            <>
              <WorkspaceHeader
                workspace={workspace}
                workspaceId={workspaceId}
                onRenameClick={() => {
                  setRenameValue(workspace?.name || '');
                  setRenameError(null);
                  setShowRenameDialog(true);
                }}
              />
              <WorkspaceNavigationTabs workspaceId={workspaceId} />
            </>
          )}

          {/* Content Area */}
          {viewMode === 'upload' && (
            <div>
              <BackButton workspaceId={workspaceId} />
              <UploadStep
                workspaceId={workspaceId}
                onComplete={() => {
                  // Data uploaded successfully, go to overview
                  navigate(`/workspace/${workspaceId}`);
                }}
              />
            </div>
          )}

          {viewMode === 'judges' && (
            <div>
              <BackButton workspaceId={workspaceId} />
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
              <BackButton workspaceId={workspaceId} />
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
              <BackButton workspaceId={workspaceId} />
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
            <RenameWorkspaceDialog
              workspace={workspace}
              renameValue={renameValue}
              renameError={renameError}
              onRenameValueChange={(value) => {
                setRenameValue(value);
                if (renameError) setRenameError(null);
              }}
              onSave={() => {
                if (renameValue.trim() && renameValue.trim() !== workspace.name) {
                  handleRenameWorkspace(renameValue.trim());
                }
              }}
              onCancel={() => {
                setShowRenameDialog(false);
                setRenameError(null);
                setRenameValue('');
              }}
            />
          )}
        </div>
      </div>
    </main>
  );
}

export default WorkspaceViewPage;
