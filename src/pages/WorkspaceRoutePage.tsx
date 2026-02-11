/**
 * Workspace Route Page Component
 * 
 * Handles routing for workspace views.
 * Extracts workspaceId and viewMode from URL params and renders WorkspaceViewPage.
 */

import { useNavigate, useParams } from 'react-router-dom';
import WorkspaceViewPage from './WorkspaceViewPage';

function WorkspaceRoutePage() {
  const { workspaceId, viewMode } = useParams<{ workspaceId: string; viewMode?: string }>();
  const navigate = useNavigate();

  if (!workspaceId) {
    navigate('/');
    return null;
  }

  return (
    <WorkspaceViewPage
      workspaceId={workspaceId}
      viewMode={viewMode || 'overview'}
      onBack={() => navigate('/')}
      showNamingOnLoad={false}
    />
  );
}

export default WorkspaceRoutePage;
