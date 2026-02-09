/**
 * Workspace Route Component
 * 
 * Handles routing for workspace views.
 * Extracts workspaceId and viewMode from URL params and renders WorkspaceView.
 */

import { useNavigate, useParams } from 'react-router-dom';
import WorkspaceView from './WorkspaceView';

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

export default WorkspaceRoute;
