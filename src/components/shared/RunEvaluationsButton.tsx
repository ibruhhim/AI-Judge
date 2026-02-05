/**
 * Run Evaluations Button Component
 * 
 * Button that triggers the evaluation process.
 * Calls the Supabase Edge Function to run all assigned
 * AI judges against their assigned questions using LLM execution.
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, getCurrentUserId } from '../../lib/supabase';
import ErrorMessage from './ErrorMessage';
import Button from './Button';

interface RunEvaluationsButtonProps {
  workspaceId: string | null;
  onComplete?: () => void;
  navigateToResults?: boolean; // If true, automatically navigate to results after completion
  resultsPath?: string; // Custom results path (defaults to /workspace/:id/results or /workflow/results)
  buttonText?: string; // Custom button text
  size?: 'sm' | 'md' | 'lg';
}

function RunEvaluationsButton({ 
  workspaceId, 
  onComplete, 
  navigateToResults = true,
  resultsPath,
  buttonText = 'Run Evaluations',
  size = 'md'
}: RunEvaluationsButtonProps) {
  const navigate = useNavigate();
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRun = async () => {
    if (!workspaceId) {
      setError('No workspace selected');
      return;
    }

    setIsRunning(true);
    setError(null);

    try {
      const userId = getCurrentUserId();

      // Call Supabase Edge Function
      const { data, error: functionError } = await supabase.functions.invoke('run-evaluations', {
        body: {
          workspaceId,
          userId,
        },
      });

      if (functionError) {
        throw functionError;
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      console.log('Evaluations completed:', data);
      
      // Call onComplete callback if provided
      if (onComplete) {
        onComplete();
      }
      
      // Navigate to results if enabled
      if (navigateToResults && workspaceId) {
        const path = resultsPath || `/workspace/${workspaceId}/results`;
        navigate(path);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to run evaluations');
      console.error('Error running evaluations:', err);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <>
      {error && (
        <ErrorMessage message={error} onDismiss={() => setError(null)} />
      )}
      <Button
        onClick={handleRun}
        disabled={isRunning || !workspaceId}
        variant="primary"
        size={size}
        icon={
          isRunning ? (
            <div className="w-4 h-4 border-2 border-button-text border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          )
        }
      >
        {isRunning ? 'Running...' : buttonText}
      </Button>
    </>
  );
}

export default RunEvaluationsButton;
