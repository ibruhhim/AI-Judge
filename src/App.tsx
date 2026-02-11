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

import { Routes, Route, useNavigate } from 'react-router-dom';
import Navbar from './components/shared/Navbar';
import HeroLandingPage from './pages/HeroLandingPage';
import WorkspacesPage from './pages/WorkspacesPage';
import WorkspaceRoutePage from './pages/WorkspaceRoutePage';
import WorkflowPage from './pages/WorkflowPage';

function App() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-bg-primary relative overflow-x-hidden pt-20">
      <div className="relative z-10">
        {/* Navigation Header */}
        <Navbar />

        {/* Main Content */}
        <Routes>
          <Route
            path="/"
            element={<HeroLandingPage />}
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
            element={<WorkspaceRoutePage />}
          />
          <Route
            path="/workspace/:workspaceId/:viewMode"
            element={<WorkspaceRoutePage />}
          />
          <Route
            path="/workflow/*"
            element={<WorkflowPage />}
          />
        </Routes>
      </div>
    </div>
  );
}

export default App;
