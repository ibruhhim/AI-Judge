/**
 * Main App Component
 * 
 * Root component with URL routing:
 * - / - Landing page (workspaces)
 * - /workspace/:workspaceId - Workspace overview
 * - /workspace/:workspaceId/:viewMode - Workspace routes (upload, judges, assign, results)
 * - /workflow/upload - New workflow upload step
 * - /workflow/judges - New workflow judges step
 * - /workflow/assign - New workflow assign step
 * - /workflow/results - New workflow results step
 */

import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation, useParams } from 'react-router-dom';
import { useTheme } from './contexts/ThemeContext';
import { supabase } from './lib/supabase';
import Navbar from './components/shared/Navbar';
import HeroLanding from './components/landing/HeroLanding';
import PalmTreeLogo from './components/shared/PalmTreeLogo';
import WorkspacesPage from './components/workspace/WorkspacesPage';
import WorkspaceView from './components/workspace/WorkspaceView';
import WorkspaceNamingDialog from './components/workspace/WorkspaceNamingDialog';
import UploadStep from './components/workflow/UploadStep';
import JudgesStep from './components/workflow/JudgesStep';
import AssignStep from './components/workflow/AssignStep';
import ResultsStep from './components/workflow/ResultsStep';
import RunEvaluationsButton from './components/shared/RunEvaluationsButton';
import { updateWorkspaceName, deleteWorkspace, deleteTemporaryWorkspaces } from './services/workspaceManagementService';

// Workflow Layout Component
function WorkflowLayout() {
  const { theme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);
  const [isWorkspaceSaved, setIsWorkspaceSaved] = useState(false); // Track if workspace was saved via Finish
  const [stepCompletion, setStepCompletion] = useState({
    upload: false,
    judges: false,
    assign: false,
    results: false,
  });
  const [showNamingDialog, setShowNamingDialog] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasGPT5Warning, setHasGPT5Warning] = useState(false);

  const steps = [
    { id: 'upload', label: 'Upload Data', number: 1, path: '/workflow/upload' },
    { id: 'judges', label: 'Configure Judges', number: 2, path: '/workflow/judges' },
    { id: 'assign', label: 'Assign Judges', number: 3, path: '/workflow/assign' },
    { id: 'results', label: 'View Results', number: 4, path: '/workflow/results' },
  ] as const;

  const currentStep = location.pathname.split('/').pop() || 'upload';
  const stepOrder = ['upload', 'judges', 'assign', 'results'];
  const currentStepIndex = stepOrder.indexOf(currentStep);

  // On app load, clear any temporary workspaces for this user.
  // This guarantees that only explicitly saved workspaces persist.
  useEffect(() => {
    deleteTemporaryWorkspaces().catch((err) => {
      console.error('Failed to delete temporary workspaces on app load:', err);
    });
  }, []);

  return (
    <>
      {/* Step Navigation */}
          <nav className="mb-8">
            <div className="glass rounded-2xl p-2 flex items-center justify-between">
              {steps.map((step, index) => {
              const isActive = currentStep === step.id;
              const stepIndex = stepOrder.indexOf(step.id);
              const isCompleted = stepIndex < currentStepIndex;

              return (
                <div key={step.id} className="flex items-center flex-1">
                  <div
                    className={`flex-1 flex items-center justify-center space-x-3 px-6 py-4 rounded-xl transition-smooth ${
                      isActive
                        ? 'bg-secondary text-primary shadow-lg'
                        : isCompleted
                        ? 'text-text-secondary'
                        : 'text-text-tertiary'
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                        isActive
                          ? 'bg-primary text-secondary'
                          : isCompleted
                        ? 'bg-bg-tertiary text-secondary'
                        : 'bg-bg-tertiary text-text-tertiary'
                      }`}
                    >
                      {isCompleted && !isActive ? '✓' : step.number}
                    </div>
                    <span className="font-semibold hidden sm:block">{step.label}</span>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`h-0.5 w-full mx-2 ${
                      isCompleted ? 'bg-text-secondary' : 'bg-bg-tertiary'
                      }`}
                    />
                  )}
                </div>
              );
            })}
            </div>
          </nav>

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

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 glass border-t border-glass p-4 z-40">
            <div className="max-w-7xl mx-auto">
              {/* GPT-5 Warning */}
              {hasGPT5Warning && currentStep === 'judges' && (
                <div className="mb-3 p-3 rounded-xl animate-fade-in" style={{ backgroundColor: 'rgba(255, 107, 53, 0.2)', border: '2px solid rgba(255, 107, 53, 0.6)' }}>
                  <div className="flex items-start space-x-2">
                    <svg
                      className="w-5 h-5 flex-shrink-0 mt-0.5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      style={{ color: '#ff6b35' }}
                    >
                      <path
                        fillRule="evenodd"
                        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <div className="flex-1">
                      <p className="text-sm font-bold mb-0.5" style={{ color: '#ff6b35' }}>
                        ⚠️ Longer Wait Times Expected
                      </p>
                      <p className="text-xs leading-tight" style={{ color: 'var(--text-primary)' }}>
                        Selected judge(s) use GPT-5 models which have significantly longer response times (3-5 minutes per request). The evaluation process may take much longer than usual.
                      </p>
                    </div>
                  </div>
                </div>
              )}
              <div className="flex items-center justify-between">
              {currentStep !== 'upload' && (
              <button
                onClick={() => {
                if (currentStepIndex > 0) {
                  navigate(steps[currentStepIndex - 1].path);
                }
              }}
              className="px-6 py-3 rounded-xl font-semibold transition-smooth glass-dark hover:bg-glass-dark text-text-primary"
              >
                <span className="flex items-center space-x-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  <span>Previous</span>
                </span>
              </button>
            )}

            <div className="flex items-center space-x-4 ml-auto">
              {currentStep === 'results' ? (
                <button
                  onClick={() => {
                    setShowNamingDialog(true);
                  }}
                  className="px-6 py-3 rounded-xl font-semibold transition-smooth bg-button-bg hover:bg-button-bg-hover text-button-text shadow-lg"
                  style={theme === 'dark' ? {
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5), 0 0 15px rgba(255, 107, 53, 0.4), 0 0 30px rgba(255, 107, 53, 0.2)',
                  } : {}}
                >
                  <span className="flex items-center space-x-2">
                    <span>Finish</span>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                </button>
            ) : (
              currentStep === 'assign' ? (
                <RunEvaluationsButton
                  workspaceId={workspaceId}
                  buttonText="Run Evaluations"
                  size="lg"
                  resultsPath="/workflow/results"
                  onComplete={() => {
                    setStepCompletion(prev => ({ ...prev, assign: true }));
                  }}
                />
              ) : (
                <button
                  onClick={() => {
                    const canProceed = 
                      (currentStep === 'upload' && stepCompletion.upload) ||
                      (currentStep === 'judges' && stepCompletion.judges);
                    
                    if (!canProceed || currentStepIndex >= stepOrder.length - 1) {
                      return;
                    }

                    navigate(steps[currentStepIndex + 1].path);
                  }}
                  disabled={
                    (currentStep === 'upload' && !stepCompletion.upload) ||
                    (currentStep === 'judges' && !stepCompletion.judges)
                  }
                  className={`px-6 py-3 rounded-xl font-semibold transition-smooth ${
                    (currentStep === 'upload' && !stepCompletion.upload) ||
                      (currentStep === 'judges' && !stepCompletion.judges)
                        ? 'bg-bg-tertiary text-text-disabled cursor-not-allowed'
                        : 'bg-button-bg hover:bg-button-bg-hover text-button-text shadow-lg'
                    }`}
                    style={((currentStep === 'upload' && stepCompletion.upload) ||
                      (currentStep === 'judges' && stepCompletion.judges)) && theme === 'dark' ? {
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5), 0 0 15px rgba(255, 107, 53, 0.4), 0 0 30px rgba(255, 107, 53, 0.2)',
                    } : {}}
                >
                  <span className="flex items-center space-x-2">
                    <span>Next</span>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                </button>
              )
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Workspace Naming Dialog */}
      {showNamingDialog && workspaceId && (
        <WorkspaceNamingDialog
          currentWorkspaceId={workspaceId}
          onSave={async (name: string) => {
            try {
              await updateWorkspaceName(workspaceId, name);
              setIsWorkspaceSaved(true); // Mark workspace as saved
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
              <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
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
    </>
  );
}

// Workspace Route Component
function WorkspaceRoute() {
  const { workspaceId, viewMode } = useParams<{ workspaceId: string; viewMode?: string }>();
  const navigate = useNavigate();

  if (!workspaceId) {
    navigate('/');
    return null;
  }

  return (
    <WorkspaceView
      workspaceId={workspaceId}
      viewMode={viewMode || 'overview'}
      onBack={() => navigate('/')}
      showNamingOnLoad={false}
    />
  );
}

// Main App Component
function App() {
  const navigate = useNavigate();
  const location = useLocation();

  // Check if we're on the hero landing page
  const isHeroLanding = location.pathname === '/';

  return (
    <div className="min-h-screen bg-bg-primary relative overflow-x-hidden pt-20">
      {/* Site-wide Background Glow Effects - Sunset Style */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
        {/* Large orange glow from top-left */}
        <div className="absolute top-0 left-0 w-[120vw] h-[120vh] bg-orange/40 rounded-full blur-[80px] -translate-x-1/4 -translate-y-1/4"></div>
        {/* Large green glow from bottom-right */}
        <div className="absolute bottom-0 right-0 w-[120vw] h-[120vh] bg-green/40 rounded-full blur-[80px] translate-x-1/4 translate-y-1/4"></div>
        {/* Center blend area */}
        <div className="absolute top-1/2 left-1/2 w-[80vw] h-[80vh] bg-orange/30 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute top-1/2 left-1/2 w-[80vw] h-[80vh] bg-green/30 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2"></div>
      </div>
      
      <div className="relative z-10">
        {/* Navigation Header */}
        <Navbar />

        {/* Main Content */}
        <main className={isHeroLanding ? '' : 'relative pb-24 page-transition'}>
          <div className={isHeroLanding ? '' : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'}>
          <Routes>
            <Route
              path="/"
              element={<HeroLanding />}
            />
            <Route
              path="/workspaces"
              element={
                <WorkspacesPage
                  onSelectWorkspace={(id) => navigate(`/workspace/${id}`)}
                  onStartNewProcess={() => navigate('/workflow/upload')}
                />
              }
            />
            <Route
              path="/workspace/:workspaceId"
              element={<WorkspaceRoute />}
            />
            <Route
              path="/workspace/:workspaceId/:viewMode"
              element={<WorkspaceRoute />}
            />
            <Route
              path="/workflow/*"
              element={<WorkflowLayout />}
            />
          </Routes>
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
