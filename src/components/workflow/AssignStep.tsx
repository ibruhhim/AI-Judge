/**
 * Assign Step Component
 * 
 * Step 3 of the workflow: Assign Judges to Questions
 * Displays all questions and allows users to assign AI judges to evaluate each question.
 * Shows a matrix view where users can toggle judge-question assignments.
 */

import { useState, useEffect } from 'react';
import { Judge, Question } from '../../types/database';
import {
  getAllUserJudges,
  assignJudgeToQuestion,
  unassignJudgeFromQuestion,
  getJudgeAssignmentsForQuestions,
  getSelectedJudgesForWorkspace,
} from '../../services/judgeManagementService';
import { getQuestionsByWorkspace, deleteQuestion } from '../../services/questionDataService';
import AssignmentMatrix from '../shared/AssignmentMatrix';
import RunEvaluationsButton from '../shared/RunEvaluationsButton';

interface AssignStepProps {
  workspaceId: string | null;
  onComplete: () => void;
  onEvaluationsComplete?: () => void; // Callback when evaluations complete
  isWorkflow?: boolean; // If true, shows "Next" button instead of separate "Run Evaluations" button
}

function AssignStep({ workspaceId, onComplete, onEvaluationsComplete, isWorkflow = false }: AssignStepProps) {
  const [judges, setJudges] = useState<Judge[]>([]);
  const [allJudges, setAllJudges] = useState<Judge[]>([]); // Store all judges
  const [questions, setQuestions] = useState<Question[]>([]);
  const [assignments, setAssignments] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; text: string } | null>(null);

  useEffect(() => {
    if (!workspaceId) return;
    loadData();
  }, [workspaceId]);

  /**
   * Loads all judges, questions, and existing assignments for the current workspace
   */
  const loadData = async () => {
    if (!workspaceId) {
      console.warn('AssignStep: No workspaceId provided');
      return;
    }

    setIsLoading(true);
    try {
      console.log('AssignStep: Loading data for workspace:', workspaceId);
      
      // Load judges (shared across all workspaces) and questions (workspace-specific)
      const [allJudgesData, questionsData, selectedJudgeIds] = await Promise.all([
        getAllUserJudges(),
        getQuestionsByWorkspace(workspaceId),
        getSelectedJudgesForWorkspace(workspaceId),
      ]);

      console.log('AssignStep: Loaded all judges:', allJudgesData.length);
      console.log('AssignStep: Loaded selected judges:', selectedJudgeIds.length);
      console.log('AssignStep: Loaded questions:', questionsData.length);
      console.log('AssignStep: Questions data:', questionsData);

      // Filter judges to only show selected ones
      const selectedJudges = allJudgesData.filter((judge) => selectedJudgeIds.includes(judge.id));

      setAllJudges(allJudgesData);
      setJudges(selectedJudges);
      setQuestions(questionsData);

      // Load existing judge-question assignments
      if (questionsData.length > 0) {
        const questionIds = questionsData.map((q) => q.id);
        const assignmentSet = await getJudgeAssignmentsForQuestions(questionIds);
        setAssignments(assignmentSet);
        console.log('AssignStep: Loaded assignments:', assignmentSet.size);
        
        // Mark step as complete if assignments already exist
        if (assignmentSet.size > 0) {
          onComplete();
        }
      }
    } catch (err) {
      console.error('AssignStep: Failed to load data:', err);
      setError(`Failed to load data: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Toggles a judge assignment to a question (assign if unassigned, unassign if assigned)
   */
  const handleToggleAssignment = async (judgeId: string, questionId: string) => {
    const key = `${judgeId}-${questionId}`;
    const isAssigned = assignments.has(key);

    try {
      if (isAssigned) {
        await unassignJudgeFromQuestion(judgeId, questionId);
        const newAssignments = new Set(assignments);
        newAssignments.delete(key);
        setAssignments(newAssignments);
      } else {
        await assignJudgeToQuestion(judgeId, questionId);
        const newAssignments = new Set(assignments);
        newAssignments.add(key);
        setAssignments(newAssignments);
        
        // Mark step as complete when first assignment is made
        if (assignments.size === 0) {
          onComplete();
        }
      }
    } catch (err) {
      console.error('Failed to toggle assignment:', err);
      setError('Failed to update assignment. Please try again.');
    }
  };

  /**
   * Initiates question deletion with confirmation
   */
  const handleDeleteQuestion = (questionId: string, questionText: string) => {
    const shortText = questionText.length > 50 ? questionText.substring(0, 50) + '...' : questionText;
    setDeleteConfirm({ id: questionId, text: shortText });
  };

  /**
   * Confirms and executes question deletion
   */
  const confirmDeleteQuestion = async () => {
    if (!deleteConfirm) return;

    try {
      await deleteQuestion(deleteConfirm.id);
      
      // Remove question from local state
      setQuestions(questions.filter(q => q.id !== deleteConfirm.id));
      
      // Remove all assignments for this question
      const newAssignments = new Set<string>();
      assignments.forEach((key) => {
        if (!key.endsWith(`-${deleteConfirm.id}`)) {
          newAssignments.add(key);
        }
      });
      setAssignments(newAssignments);
      
      console.log('AssignStep: Successfully deleted question:', deleteConfirm.id);
      setError(null); // Clear any previous errors
      setDeleteConfirm(null);
    } catch (err) {
      console.error('Failed to delete question:', err);
      setError(`Failed to delete question: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };


  if (isLoading) {
    return (
      <div className="glass rounded-3xl p-12 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
          <p className="text-text-tertiary">Loading questions and judges...</p>
        </div>
      </div>
    );
  }

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

  if (judges.length === 0) {
    return (
      <div className="glass rounded-3xl p-12 text-center">
        <div className="text-text-secondary text-lg mb-2">No judges selected</div>
        <div className="text-text-tertiary">
          {allJudges.length === 0
            ? 'Please create at least one AI judge in the Configure Judges section'
            : 'Please select at least one judge in the Configure Judges section to use in this workspace'}
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="glass rounded-3xl p-12 text-center">
        <div className="text-text-secondary text-lg mb-2">No questions found</div>
        <div className="text-text-tertiary">Please upload data with questions first</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="glass rounded-3xl p-8 shadow-2xl">
        <div className="mb-6">
          <h2 className="text-4xl font-bold mb-2 gradient-text">Assign Judges to Questions</h2>
          <p className="text-text-tertiary mb-4">
            Select which AI judges should evaluate each question. You can assign multiple judges to the same question.
          </p>
          <div className="text-sm text-text-tertiary mb-4">
            Found {questions.length} question{questions.length !== 1 ? 's' : ''} and {judges.length} judge{judges.length !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-danger-bg border border-danger rounded-xl text-danger backdrop-blur-sm">
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span className="text-sm">{error}</span>
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

        {/* Run Evaluations Button (only in workspace view, not workflow) */}
        {!isWorkflow && assignments.size > 0 && (
          <div className="mb-6 pt-6 border-t border-white/10">
            <RunEvaluationsButton
              workspaceId={workspaceId}
              onComplete={() => {
                onComplete();
                if (onEvaluationsComplete) {
                  onEvaluationsComplete();
                }
              }}
            />
          </div>
        )}
      </div>

      <AssignmentMatrix
        judges={judges}
        questions={questions}
        assignments={assignments}
        onToggle={handleToggleAssignment}
        onDelete={handleDeleteQuestion}
      />

      {/* Delete Confirmation Dialog */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-overlay backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass rounded-3xl p-8 shadow-2xl max-w-md w-full">
            <h3 className="text-2xl font-bold mb-4 text-text-primary">Delete Question?</h3>
            <p className="text-text-secondary mb-2">
              Are you sure you want to delete this question?
            </p>
            <div className="glass-dark rounded-xl p-4 mb-4">
              <p className="text-text-primary italic">"{deleteConfirm.text}"</p>
            </div>
            <p className="text-text-tertiary text-sm mb-6">
              This will also delete all answers, evaluations, and judge assignments for this question.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={confirmDeleteQuestion}
                className="flex-1 px-6 py-3 bg-danger hover:bg-danger-hover text-button-text rounded-xl font-semibold transition-smooth"
              >
                Delete
              </button>
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-6 py-3 glass-dark hover:bg-glass-dark text-text-primary rounded-xl font-semibold transition-smooth"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AssignStep;
