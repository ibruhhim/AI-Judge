/**
 * Workflow Layout Component
 * 
 * Handles the multi-step workflow for creating and evaluating submissions.
 * Manages state for workspace, step completion, and navigation between steps.
 */

import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import UploadStep from './UploadStep';
import JudgesStep from './JudgesStep';
import AssignStep from './AssignStep';
import ResultsStep from './ResultsStep';
import RunEvaluationsButton from '../shared/RunEvaluationsButton';
import WorkspaceNamingDialog from '../workspace/WorkspaceNamingDialog';
import { updateWorkspaceName, deleteWorkspace, deleteTemporaryWorkspaces } from '../../services/workspaceManagementService';
import StepNavigation from './StepNavigation';
import BottomNavigation from './BottomNavigation';

const steps = [
  { id: 'upload', label: 'Upload Data', number: 1, path: '/workflow/upload' },
  { id: 'judges', label: 'Configure Judges', number: 2, path: '/workflow/judges' },
  { id: 'assign', label: 'Assign Judges', number: 3, path: '/workflow/assign' },
  { id: 'results', label: 'View Results', number: 4, path: '/workflow/results' },
] as const;

function WorkflowLayout() {
  const { theme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);
  const [stepCompletion, setStepCompletion] = useState({
    upload: false,
    judges: false,
    assign: false,
    results: false,
  });
  const [showNamingDialog, setShowNamingDialog] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasGPT5Warning, setHasGPT5Warning] = useState(false);

  const currentStep = location.pathname.split('/').pop() || 'upload';
  const currentStepIndex = steps.findIndex(s => s.id === currentStep);

  // On app load, clear any temporary workspaces for this user.
  // This guarantees that only explicitly saved workspaces persist.
  useEffect(() => {
    deleteTemporaryWorkspaces().catch((err) => {
      console.error('Failed to delete temporary workspaces on app load:', err);
    });
  }, []);

  return (
    <main className="relative pb-24 page-transition">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <StepNavigation steps={steps} currentStep={currentStep} currentStepIndex={currentStepIndex} />

        {/* Routes */}
      <Routes>
        <Route
          path="upload"
          element={
            <UploadStep
              workspaceId={workspaceId}
              onComplete={(id) => {
                setWorkspaceId(id);
                setStepCompletion(prev => ({ ...prev, upload: true }));
              }}
            />
          }
        />
        <Route
          path="judges"
          element={
            <JudgesStep
              workspaceId={workspaceId}
              onComplete={() => {
                setStepCompletion(prev => ({ ...prev, judges: true }));
              }}
              onGPT5WarningChange={(hasGPT5) => setHasGPT5Warning(hasGPT5)}
            />
          }
        />
        <Route
          path="assign"
          element={
            <AssignStep
              workspaceId={workspaceId}
              isWorkflow={true}
              onComplete={() => {
                setStepCompletion(prev => ({ ...prev, assign: true }));
              }}
              onEvaluationsComplete={() => {
                navigate('/workflow/results');
              }}
            />
          }
        />
        <Route
          path="results"
          element={
            <ResultsStep 
              workspaceId={workspaceId}
              onBackToWorkspaces={() => {
                if (workspaceId) {
                  navigate(`/workspace/${workspaceId}`);
                } else {
                  navigate('/');
                }
              }}
              onResultsLoaded={() => {}}
              isInWorkflow={true}
            />
          }
        />
      </Routes>

      <BottomNavigation
        currentStep={currentStep}
        currentStepIndex={currentStepIndex}
        steps={steps}
        stepCompletion={stepCompletion}
        workspaceId={workspaceId}
        hasGPT5Warning={hasGPT5Warning}
        onFinish={() => setShowNamingDialog(true)}
        onStepComplete={(step) => {
          setStepCompletion(prev => ({ ...prev, [step]: true }));
        }}
        onNavigate={(path) => navigate(path)}
      />

      {/* Workspace Naming Dialog */}
      {showNamingDialog && workspaceId && (
        <WorkspaceNamingDialog
          currentWorkspaceId={workspaceId}
          onSave={async (name: string) => {
            try {
              await updateWorkspaceName(workspaceId, name);
              setShowNamingDialog(false);
              setError(null);
              navigate(`/workspace/${workspaceId}`);
            } catch (err) {
              console.error('Failed to save workspace name:', err);
              setError('Failed to save workspace name. Please try again.');
            }
          }}
          onSkip={async () => {
            try {
              await deleteWorkspace(workspaceId);
              setShowNamingDialog(false);
              setError(null);
              setWorkspaceId(null);
              navigate('/');
            } catch (err) {
              console.error('Failed to delete workspace:', err);
              setError('Failed to delete workspace. Please try again.');
            }
          }}
        />
      )}

      {/* Error Message */}
      {error && (
        <div className="fixed top-4 right-4 z-50 p-4 bg-red-900/30 border border-red-700/50 rounded-xl text-red-300 backdrop-blur-sm max-w-md">
          <div className="flex items-center space-x-2">
            <svg className="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span className="text-sm flex-1">{error}</span>
            <button
              onClick={() => setError(null)}
              className="ml-2 text-red-300 hover:text-red-200"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      )}
      </div>
    </main>
  );
}

export default WorkflowLayout;
