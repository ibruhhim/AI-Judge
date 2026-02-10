/**
 * Workspace Navigation Tabs Component
 * 
 * Displays navigation cards for different workspace views
 */

import { useNavigate } from 'react-router-dom';

interface WorkspaceNavigationTabsProps {
  workspaceId: string;
}

function WorkspaceNavigationTabs({ workspaceId }: WorkspaceNavigationTabsProps) {
  const navigate = useNavigate();

  const tabs = [
    {
      id: 'upload',
      title: 'Upload Data',
      description: 'Import or update submissions',
      icon: (
        <svg className="w-6 h-6 text-text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
      ),
    },
    {
      id: 'judges',
      title: 'Configure Judges',
      description: 'Create and manage AI judges',
      icon: (
        <svg className="w-6 h-6 text-text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
    },
    {
      id: 'assign',
      title: 'Assign Judges',
      description: 'Assign judges to questions',
      icon: (
        <svg className="w-6 h-6 text-text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
    },
    {
      id: 'results',
      title: 'View Results',
      description: 'See evaluation results',
      icon: (
        <svg className="w-6 h-6 text-text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => navigate(`/workspace/${workspaceId}/${tab.id}`)}
          className="glass-dark rounded-2xl p-6 text-left hover:bg-glass-dark transition-smooth hover:scale-105"
        >
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-glass-dark flex items-center justify-center">
              {tab.icon}
            </div>
            <h3 className="text-xl font-semibold text-text-primary">{tab.title}</h3>
          </div>
          <p className="text-text-tertiary text-sm">{tab.description}</p>
        </button>
      ))}
    </div>
  );
}

export default WorkspaceNavigationTabs;
