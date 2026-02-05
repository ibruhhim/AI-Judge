/**
 * Judges Step Component
 * 
 * Step 2 of the workflow: Configure Judges
 * Allows users to:
 * - Create AI judge configurations (name, prompt, model)
 * - Edit existing AI judge configurations
 * - Delete AI judges
 * - View all their AI judges
 * 
 * Judges are shared across all workspaces for a user.
 */

import { useState, useEffect } from 'react';
import { Judge } from '../../types/database';
import { useTheme } from '../../contexts/ThemeContext';
import {
  getAllUserJudges,
  createNewJudge,
  updateJudge,
  deleteJudge,
  getSelectedJudgesForWorkspace,
  toggleJudgeSelectionForWorkspace,
} from '../../services/judgeManagementService';
import { getJudgeAvatarUrl } from '../../utils/judgeAvatar';
import JudgeForm from '../judge/JudgeForm';
import JudgeProfile from '../judge/JudgeProfile';

interface JudgesStepProps {
  workspaceId: string | null;
  onComplete: () => void;
  onRunEvaluations?: () => void; // Optional: Run evaluations button handler
  isRunningEvaluations?: boolean; // Optional: Whether evaluations are running
  onGPT5WarningChange?: (hasGPT5: boolean) => void; // Callback to notify parent about GPT-5 judges
}

function JudgesStep({ workspaceId, onComplete, onRunEvaluations, isRunningEvaluations = false, onGPT5WarningChange }: JudgesStepProps) {
  const { theme } = useTheme();
  const [judges, setJudges] = useState<Judge[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedJudgeId, setSelectedJudgeId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedJudgeIds, setSelectedJudgeIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadJudges();
    if (workspaceId) {
      loadSelectedJudges();
    }
  }, [workspaceId]);

  // Check for GPT-5 models whenever judges or selectedJudgeIds change
  useEffect(() => {
    if (judges.length > 0 && selectedJudgeIds.size > 0) {
      const hasGPT5 = judges.some((j) => selectedJudgeIds.has(j.id) && j.model.toLowerCase().includes('gpt-5'));
      onGPT5WarningChange?.(hasGPT5);
    } else {
      onGPT5WarningChange?.(false);
    }
  }, [judges, selectedJudgeIds, onGPT5WarningChange]);

  /**
   * Loads all AI judges for the current user
   */
  const loadJudges = async () => {
    setIsLoading(true);
    try {
      const judgesData = await getAllUserJudges();
      setJudges(judgesData);
      // Mark step as complete if judges already exist
      if (judgesData.length > 0) {
        onComplete();
      }
    } catch (err) {
      console.error('Failed to load judges:', err);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Loads selected judges for the current workspace
   */
  const loadSelectedJudges = async () => {
    if (!workspaceId) return;
    try {
      const selectedIds = await getSelectedJudgesForWorkspace(workspaceId);
      setSelectedJudgeIds(new Set(selectedIds));
    } catch (err) {
      console.error('Failed to load selected judges:', err);
    }
  };

  /**
   * Toggles a judge's selection status for the workspace
   */
  const handleToggleSelection = async (judgeId: string, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent opening the judge profile
    if (!workspaceId) return;

    try {
      const isNowSelected = await toggleJudgeSelectionForWorkspace(workspaceId, judgeId);
      const newSelectedIds = new Set(selectedJudgeIds);
      if (isNowSelected) {
        newSelectedIds.add(judgeId);
      } else {
        newSelectedIds.delete(judgeId);
      }
      setSelectedJudgeIds(newSelectedIds);
    } catch (err) {
      console.error('Failed to toggle judge selection:', err);
      setError('Failed to update selection. Please try again.');
    }
  };

  /**
   * Creates a new AI judge and adds it to the list
   */
  const handleCreateJudge = async (name: string, prompt: string, model: string) => {
    const newJudge = await createNewJudge(name, prompt, model);
    setJudges([newJudge, ...judges]);
    setShowCreateForm(false);
    // Mark step as complete when at least one judge is created
    if (judges.length === 0) {
      onComplete();
    }
  };

  /**
   * Updates an existing AI judge
   */
  const handleUpdateJudge = async (name: string, prompt: string, model: string) => {
    if (!selectedJudgeId) return;
    
    const updatedJudge = await updateJudge(selectedJudgeId, name, prompt, model);
    setJudges(judges.map((j) => (j.id === selectedJudgeId ? updatedJudge : j)));
  };

  /**
   * Deletes an AI judge
   */
  const handleDeleteJudge = async (judgeId: string, judgeName: string) => {
    try {
      await deleteJudge(judgeId);
      setJudges(judges.filter((j) => j.id !== judgeId));
      setSelectedJudgeId(null);
      setError(null);
    } catch (err) {
      console.error('Failed to delete judge:', err);
      setError('Failed to delete judge. Please try again.');
    }
  };

  /**
   * Opens a judge's profile view
   */
  const handleJudgeClick = (judgeId: string) => {
    setSelectedJudgeId(judgeId);
    setShowCreateForm(false);
  };

  /**
   * Closes the profile view
   */
  const handleCloseProfile = () => {
    setSelectedJudgeId(null);
  };


  if (isLoading) {
    return (
      <div className="glass rounded-3xl p-12 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
          <p className="text-text-tertiary">Loading judges...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="glass rounded-3xl p-8 shadow-2xl">
        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-danger-bg border border-danger rounded-xl text-danger backdrop-blur-sm">
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

        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-4xl font-bold mb-2 gradient-text">AI Judges</h2>
            <p className="text-text-tertiary">Configure your evaluation criteria</p>
          </div>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className={`px-6 py-3 rounded-xl font-semibold transition-smooth ${
              showCreateForm
                ? 'bg-bg-tertiary hover:bg-bg-secondary text-text-primary'
                : 'bg-button-bg hover:bg-button-bg-hover text-button-text shadow-lg'
            }`}
            style={!showCreateForm && theme === 'dark' ? {
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5), 0 0 15px rgba(255, 107, 53, 0.4), 0 0 30px rgba(255, 107, 53, 0.2)',
            } : {}}
          >
            {showCreateForm ? 'Cancel' : '+ Create Judge'}
          </button>
        </div>

        {showCreateForm && (
          <div className="mb-6">
            <JudgeForm
              onSubmit={handleCreateJudge}
              onCancel={() => setShowCreateForm(false)}
            />
          </div>
        )}

        {/* Run Evaluations Button (only show if handler provided and workspaceId exists) */}
        {onRunEvaluations && workspaceId && (
          <div className="mb-6 pt-6 border-t border-white/10">
            <button
              onClick={onRunEvaluations}
              disabled={isRunningEvaluations}
              className="w-full px-6 py-4 bg-button-bg hover:bg-button-bg-hover text-button-text rounded-xl font-semibold transition-smooth shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              style={theme === 'dark' ? {
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5), 0 0 15px rgba(255, 107, 53, 0.4), 0 0 30px rgba(255, 107, 53, 0.2)',
              } : {}}
            >
              {isRunningEvaluations ? (
                <>
                  <div className="w-5 h-5 border-2 border-button-text border-t-transparent rounded-full animate-spin"></div>
                  <span>Running Evaluations...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span>Run Evaluations</span>
                </>
              )}
            </button>
          </div>
        )}

        {workspaceId && (
          <div className="mb-4 text-sm text-text-tertiary">
            Select which judges you want to use in this workspace. Only selected judges will appear in the Assign section.
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          {judges.map((judge) => {
            const isSelected = selectedJudgeIds.has(judge.id);
            const isGPT5 = judge.model.toLowerCase().includes('gpt-5');
            return (
              <div
                key={judge.id}
                className={`glass-dark rounded-2xl p-6 cursor-pointer hover:bg-glass-dark transition-smooth hover:scale-105 hover:shadow-xl relative overflow-visible ${
                  isSelected ? 'ring-2 ring-orange ring-opacity-50' : ''
                }`}
              >
                {/* Selection Checkbox */}
                {workspaceId && (
                  <div
                    onClick={(e) => handleToggleSelection(judge.id, e)}
                    className="absolute top-4 right-4 z-30"
                  >
                    <div
                      className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-smooth ${
                        isSelected
                          ? 'bg-orange border-orange'
                          : 'bg-transparent border-text-tertiary hover:border-orange'
                      }`}
                    >
                      {isSelected && (
                        <svg className={`w-4 h-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`} fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </div>
                  </div>
                )}
                <div
                  onClick={() => handleJudgeClick(judge.id)}
                  className="flex flex-col items-center space-y-4"
                >
                  <img
                    src={getJudgeAvatarUrl(judge.id)}
                    alt={judge.name}
                    className="w-20 h-20 rounded-2xl object-cover border-4 border-white/20"
                  />
                  <div className="text-center w-full">
                    <h3 className="font-semibold text-text-primary text-lg mb-2">{judge.name}</h3>
                    <div className="flex items-center justify-center space-x-2 mb-2">
                      <span className="px-2 py-1 text-xs rounded-lg bg-bg-tertiary text-text-secondary border border-glass">
                        {judge.model}
                      </span>
                    </div>
                    <p className="text-sm text-text-tertiary line-clamp-2">
                      {judge.system_prompt.substring(0, 80)}...
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
          {judges.length === 0 && (
            <div className="text-center py-12">
              <p className="text-text-secondary text-lg">No judges created yet</p>
              <p className="text-text-tertiary text-sm mt-2">Create your first AI judge to get started</p>
            </div>
          )}
        </div>
      </div>

      {/* Judge Profile Modal */}
      {selectedJudgeId && (
        <JudgeProfile
          judge={judges.find((j) => j.id === selectedJudgeId)!}
          onUpdate={handleUpdateJudge}
          onDelete={handleDeleteJudge}
          onClose={handleCloseProfile}
        />
      )}
    </div>
  );
}

export default JudgesStep;
