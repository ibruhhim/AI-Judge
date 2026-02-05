/**
 * Results Step Component
 * 
 * Step 3 of the workflow: Results
 * Displays evaluation results with:
 * - Statistics dashboard (total evaluations, pass rate, passed count)
 * - Filter controls (by judge, question, verdict)
 * - Results table with all evaluation details
 */

import { useState, useEffect } from 'react';
import { Evaluation, Verdict } from '../../types/database';
import {
  getEvaluationsWithFilters,
  calculatePassRate,
} from '../../services/evaluationQueryService';
import ResultsFilters, { QuestionType, SortOption } from '../results/ResultsFilters';
import ResultsTable from '../results/ResultsTable';
import ResultsStats from '../results/ResultsStats';

interface ResultsStepProps {
  workspaceId: string | null;
  onBackToWorkspaces?: () => void;
  onResultsLoaded?: () => void; // Callback when results finish loading
  isInWorkflow?: boolean; // If true, we're in the linear workflow (not workspace view)
}

function ResultsStep({ workspaceId, onBackToWorkspaces, onResultsLoaded, isInWorkflow = false }: ResultsStepProps) {
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasCalledOnResultsLoaded, setHasCalledOnResultsLoaded] = useState(false);
  const [filters, setFilters] = useState<{
    questionText: string;
    verdict: Verdict | '';
    questionType: QuestionType | '';
    sortBy: SortOption;
  }>({
    questionText: '',
    verdict: '',
    questionType: '',
    sortBy: 'default',
  });

  useEffect(() => {
    if (workspaceId) {
      // Reset the flag when workspace changes
      setHasCalledOnResultsLoaded(false);
      loadEvaluations();
    }
  }, [workspaceId, filters]);

  /**
   * Loads evaluation results with current filters applied
   */
  const loadEvaluations = async () => {
    if (!workspaceId) return;

    setIsLoading(true);
    try {
      const data = await getEvaluationsWithFilters(workspaceId, {
        questionText: filters.questionText || undefined,
        verdict: filters.verdict || undefined,
        questionType: filters.questionType || undefined,
      });
      setEvaluations(data);
      
      // Notify parent that results have loaded (for showing naming dialog)
      // Only call once when results first load (not on filter changes)
      if (onResultsLoaded && data && data.length > 0 && !hasCalledOnResultsLoaded) {
        if (filters.questionText === '' && filters.verdict === '' && filters.questionType === '') {
          onResultsLoaded();
          setHasCalledOnResultsLoaded(true);
        }
      }
    } catch (err) {
      console.error('Failed to load evaluations:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!workspaceId) {
    return (
      <div className="glass rounded-3xl p-6 border-glass bg-bg-secondary">
        <div className="flex items-center space-x-3 text-text-secondary">
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <span className="font-medium">Please upload data first</span>
        </div>
      </div>
    );
  }

  const passRate = calculatePassRate(evaluations);

  return (
    <div className="space-y-8">
      <ResultsStats
        total={evaluations.length}
        passRate={passRate}
        passed={evaluations.filter((e) => e.verdict === 'pass').length}
      />

      <ResultsFilters filters={filters} onFiltersChange={setFilters} />

      <ResultsTable evaluations={evaluations} isLoading={isLoading} sortBy={filters.sortBy} />
    </div>
  );
}

export default ResultsStep;
