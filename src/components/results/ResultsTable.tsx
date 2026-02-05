/**
 * Results Table Component
 * 
 * Displays evaluation results organized by question with dropdowns.
 * Each question can be expanded to show:
 * - Filter by AI judge
 * - All submissions for that question with their answers and evaluations
 */

import { useState, useEffect } from 'react';
import { Evaluation, Verdict } from '../../types/database';
import { getQuestionTexts, getJudgeNames, getAnswersForQuestions } from '../../services/evaluationQueryService';
import LoadingSpinner from '../shared/LoadingSpinner';
import EmptyState from '../shared/EmptyState';
import { SortOption } from './ResultsFilters';

interface ResultsTableProps {
  evaluations: Evaluation[];
  isLoading: boolean;
  sortBy?: SortOption;
}

interface JudgePassRate {
  judgeId: string;
  judgeName: string;
  passRate: number;
  totalEvaluations: number;
  passed: number;
}

interface QuestionGroup {
  questionId: string;
  questionText: string | null;
  submissions: SubmissionGroup[];
  passRate: number; // Overall pass rate
  judgePassRates: JudgePassRate[]; // Pass rate per judge
  originalIndex: number; // Original order index for default sorting
}

interface SubmissionGroup {
  submissionId: string;
  answer: unknown;
  evaluations: Evaluation[];
}

function ResultsTable({ evaluations, isLoading, sortBy = 'alphabetical' }: ResultsTableProps) {
  const [questionGroups, setQuestionGroups] = useState<QuestionGroup[]>([]);
  const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(new Set());
  const [judgeFilters, setJudgeFilters] = useState<Map<string, string>>(new Map()); // questionId -> judgeId filter
  const [questionTexts, setQuestionTexts] = useState<Map<string, string | null>>(new Map());
  const [judgeNames, setJudgeNames] = useState<Map<string, string | null>>(new Map());
  const [answers, setAnswers] = useState<Map<string, unknown>>(new Map());

  /**
   * Returns Tailwind CSS classes for verdict badge colors
   */
  const getVerdictColor = (verdict: Verdict) => {
    switch (verdict) {
      case 'pass':
        return 'bg-green-500/20 text-green-500 border border-green-500/40';
      case 'fail':
        return 'bg-red-500/20 text-red-500 border border-red-500/40';
      case 'inconclusive':
        return 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/40';
    }
  };

  /**
   * Groups evaluations by question text (deduplicated), then by submission
   * Multiple submissions can have the same question text, but different question IDs
   */
  useEffect(() => {
    if (evaluations.length === 0) {
      setQuestionGroups([]);
      return;
    }

    // First, group by question_text (deduplicated)
    // We'll use the first question_id we see for each unique question_text as the group key
    const questionTextMap = new Map<string, { questionId: string; evaluations: Evaluation[]; originalIndex: number }>();
    let questionGroupIndex = 0; // Track the order in which question groups are first encountered
    
    console.log('ResultsTable: Grouping evaluations. Total evaluations:', evaluations.length);
    console.log('ResultsTable: Question texts loaded:', questionTexts.size);
    console.log('ResultsTable: Sample question texts:', Array.from(questionTexts.entries()).slice(0, 3));
    
    // Track unique submission IDs
    const uniqueSubmissionIds = new Set<string>();
    evaluations.forEach((evaluation) => {
      uniqueSubmissionIds.add(evaluation.submission_id);
    });
    console.log('ResultsTable: Unique submission IDs in evaluations:', uniqueSubmissionIds.size, Array.from(uniqueSubmissionIds).slice(0, 5));
    
    evaluations.forEach((evaluation) => {
      const questionId = evaluation.question_id;
      const questionText = questionTexts.get(questionId);
      
      // If question text is not loaded yet, use question ID as fallback (but this means each question will be separate)
      // This is okay - we'll regroup when question texts load
      const textForGrouping = questionText || questionId;
      
      // Normalize question text for grouping (case-insensitive, trimmed)
      const normalizedText = textForGrouping.toLowerCase().trim();
      
      if (!questionTextMap.has(normalizedText)) {
        questionTextMap.set(normalizedText, {
          questionId, // Use first question ID we encounter for this text
          evaluations: [],
          originalIndex: questionGroupIndex++, // Track the order this question group was first seen
        });
      }
      questionTextMap.get(normalizedText)!.evaluations.push(evaluation);
    });
    
    console.log('ResultsTable: Created question groups:', questionTextMap.size);

    // Then group by submission_id within each question
    const groups: QuestionGroup[] = [];
    questionTextMap.forEach(({ questionId: groupQuestionId, evaluations: questionEvaluations, originalIndex }, normalizedText) => {
      // Group evaluations by submission_id
      const submissionMap = new Map<string, { questionId: string; evaluations: Evaluation[] }>();
      const submissionIdsInThisQuestion = new Set<string>();
      questionEvaluations.forEach((evaluation) => {
        const submissionId = evaluation.submission_id;
        const actualQuestionId = evaluation.question_id; // The actual question ID for this submission
        submissionIdsInThisQuestion.add(submissionId);
        
        if (!submissionMap.has(submissionId)) {
          submissionMap.set(submissionId, {
            questionId: actualQuestionId,
            evaluations: [],
          });
        }
        submissionMap.get(submissionId)!.evaluations.push(evaluation);
      });
      
      console.log(`ResultsTable: Question "${normalizedText.substring(0, 50)}..." has ${submissionMap.size} unique submissions`);
      console.log(`ResultsTable: Submission IDs for this question:`, Array.from(submissionIdsInThisQuestion).slice(0, 10));

      // Create submission groups with correct answer for each submission's question
      const submissionGroups: SubmissionGroup[] = [];
      submissionMap.forEach(({ questionId: submissionQuestionId, evaluations: submissionEvaluations }, submissionId) => {
        // Get the answer for this specific question_id (which belongs to this submission)
        const answer = answers.get(submissionQuestionId) || null;
        console.log(`ResultsTable: Adding submission ${submissionId} with ${submissionEvaluations.length} evaluations`);
        submissionGroups.push({
          submissionId,
          answer,
          evaluations: submissionEvaluations,
        });
      });
      
      console.log(`ResultsTable: Created ${submissionGroups.length} submission groups for question "${normalizedText}"`);

      // Calculate overall pass rate for this question (across all submissions)
      const totalEvaluations = questionEvaluations.length;
      const passed = questionEvaluations.filter((e) => e.verdict === 'pass').length;
      const passRate = totalEvaluations > 0 ? (passed / totalEvaluations) * 100 : 0;

      // Calculate pass rate per judge
      const judgeEvaluationMap = new Map<string, Evaluation[]>();
      questionEvaluations.forEach((evaluation) => {
        const judgeId = evaluation.judge_id;
        if (!judgeEvaluationMap.has(judgeId)) {
          judgeEvaluationMap.set(judgeId, []);
        }
        judgeEvaluationMap.get(judgeId)!.push(evaluation);
      });

      const judgePassRates: JudgePassRate[] = [];
      judgeEvaluationMap.forEach((judgeEvaluations, judgeId) => {
        const judgePassed = judgeEvaluations.filter((e) => e.verdict === 'pass').length;
        const judgePassRate = judgeEvaluations.length > 0 ? (judgePassed / judgeEvaluations.length) * 100 : 0;
        const judgeName = judgeNames.get(judgeId) || `Judge ${judgeId.slice(0, 8)}...`;
        
        judgePassRates.push({
          judgeId,
          judgeName,
          passRate: judgePassRate,
          totalEvaluations: judgeEvaluations.length,
          passed: judgePassed,
        });
      });

      // Sort judges by name for consistent display
      judgePassRates.sort((a, b) => a.judgeName.localeCompare(b.judgeName));

      // Get question text for display (use the first one we found)
      const displayText = questionTexts.get(groupQuestionId) || normalizedText;

      groups.push({
        questionId: groupQuestionId, // Use the group question ID for the dropdown key
        questionText: displayText,
        submissions: submissionGroups,
        passRate,
        judgePassRates,
        originalIndex, // Store original order for default sorting
      });
    });

    // Sort based on sortBy option
    groups.sort((a, b) => {
      switch (sortBy) {
        case 'default':
          // Preserve original order (as questions were first encountered)
          return a.originalIndex - b.originalIndex;
        case 'best_to_worst':
          // Highest pass rate first (descending)
          return b.passRate - a.passRate;
        case 'worst_to_best':
          // Lowest pass rate first (ascending)
          return a.passRate - b.passRate;
        case 'alphabetical':
          // Alphabetical by question text
          const aText = a.questionText || a.questionId;
          const bText = b.questionText || b.questionId;
          return aText.localeCompare(bText);
        default:
          // Fallback to original order
          return a.originalIndex - b.originalIndex;
      }
    });

    setQuestionGroups(groups);
  }, [evaluations, questionTexts, answers, judgeNames, sortBy]);

  /**
   * Loads question texts, judge names, and answers in bulk
   */
  useEffect(() => {
    if (evaluations.length === 0) return;

    const questionIds = Array.from(new Set(evaluations.map((e) => e.question_id)));
    const judgeIds = Array.from(new Set(evaluations.map((e) => e.judge_id)));

    console.log('ResultsTable: Loading data for questions:', questionIds);
    console.log('ResultsTable: Loading data for judges:', judgeIds);

    Promise.all([
      getQuestionTexts(questionIds),
      getJudgeNames(judgeIds),
      getAnswersForQuestions(questionIds),
    ]).then(([texts, names, answerData]) => {
      console.log('ResultsTable: Received question texts:', texts);
      console.log('ResultsTable: Received judge names:', names);
      console.log('ResultsTable: Received answers:', answerData);
      
      setQuestionTexts(texts);
      setJudgeNames(names);
      setAnswers(answerData);
    }).catch((error) => {
      console.error('Error loading question texts, judge names, or answers:', error);
    });
  }, [evaluations]);

  /**
   * Toggles expansion of a question dropdown
   */
  const toggleQuestion = (questionId: string) => {
    setExpandedQuestions((prev) => {
      const next = new Set(prev);
      if (next.has(questionId)) {
        next.delete(questionId);
      } else {
        next.add(questionId);
      }
      return next;
    });
  };

  /**
   * Sets the judge filter for a specific question
   */
  const setJudgeFilter = (questionId: string, judgeId: string) => {
    setJudgeFilters((prev) => {
      const next = new Map(prev);
      if (judgeId === '') {
        next.delete(questionId);
      } else {
        next.set(questionId, judgeId);
      }
      return next;
    });
  };

  /**
   * Gets unique judge IDs for evaluations in a question
   */
  const getJudgesForQuestion = (questionEvaluations: Evaluation[]): string[] => {
    const judgeSet = new Set<string>();
    questionEvaluations.forEach((e) => judgeSet.add(e.judge_id));
    return Array.from(judgeSet);
  };

  /**
   * Formats answer JSON for display
   */
  const formatAnswer = (answer: unknown): string => {
    if (answer === null || answer === undefined) {
      return 'No answer provided';
    }
    if (typeof answer === 'string') {
      return answer;
    }
    if (typeof answer === 'object') {
      // Try to extract meaningful fields
      const obj = answer as Record<string, unknown>;
      if (obj.choice !== undefined) {
        return `Choice: ${String(obj.choice)}${obj.reasoning ? ` - ${String(obj.reasoning)}` : ''}`;
      }
      if (obj.text !== undefined) {
        return String(obj.text);
      }
      return JSON.stringify(answer, null, 2);
    }
    return String(answer);
  };

  /**
   * Toggles expansion of evaluation reasoning
   */
  const [expandedReasoning, setExpandedReasoning] = useState<Set<string>>(new Set());
  const toggleReasoning = (evaluationId: string) => {
    setExpandedReasoning((prev) => {
      const next = new Set(prev);
      if (next.has(evaluationId)) {
        next.delete(evaluationId);
      } else {
        next.add(evaluationId);
      }
      return next;
    });
  };

  if (isLoading) {
    return (
      <div className="glass rounded-3xl p-12 flex items-center justify-center">
        <LoadingSpinner message="Loading evaluation results..." />
      </div>
    );
  }

  if (evaluations.length === 0) {
    return (
      <EmptyState
        title="No evaluations found"
        description="Run AI Judges first to see results"
      />
    );
  }

  return (
    <div className="glass rounded-3xl p-8 shadow-2xl">
      <h2 className="text-4xl font-bold mb-2 gradient-text">Evaluation Results</h2>
      <p className="text-text-tertiary mb-6">Results organized by question</p>

      <div className="mb-6 flex flex-wrap items-center gap-2 text-xs">
        <span className="text-text-tertiary mr-1">Verdicts:</span>
        <span className={`px-3 py-1 font-bold rounded-lg ${getVerdictColor('pass')}`}>PASS</span>
        <span className={`px-3 py-1 font-bold rounded-lg ${getVerdictColor('fail')}`}>FAIL</span>
        <span className={`px-3 py-1 font-bold rounded-lg ${getVerdictColor('inconclusive')}`}>INCONCLUSIVE</span>
        <span className="text-text-tertiary ml-1">• Expand a question to see per-judge verdicts</span>
      </div>
      
      <div className="space-y-4">
        {questionGroups.map((group) => {
          const isExpanded = expandedQuestions.has(group.questionId);
          const judgeFilter = judgeFilters.get(group.questionId) || '';
          
          // Get all evaluations for this question (across all submissions)
          const allQuestionEvaluations = group.submissions.flatMap((s) => s.evaluations);
          const availableJudges = getJudgesForQuestion(allQuestionEvaluations);
          
          // Filter evaluations by selected judge if filter is set
          const filteredSubmissions = group.submissions.map((submission) => ({
            ...submission,
            evaluations: judgeFilter
              ? submission.evaluations.filter((e) => e.judge_id === judgeFilter)
              : submission.evaluations,
          })).filter((submission) => submission.evaluations.length > 0);

          const questionText = group.questionText || `Question ${group.questionId.slice(0, 8)}...`;

          return (
            <div key={group.questionId} className="glass-dark rounded-2xl overflow-hidden">
              {/* Question Header - Clickable to expand/collapse */}
              <button
                onClick={() => toggleQuestion(group.questionId)}
                className="w-full p-6 text-left hover:bg-glass-dark transition-smooth"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center flex-wrap gap-2 mb-2">
                      <span className="px-3 py-1 text-xs font-bold rounded-full bg-bg-tertiary text-text-primary">
                        Overall: {group.passRate.toFixed(1)}%
                      </span>
                      {group.judgePassRates.map((judgeRate) => (
                        <span
                          key={judgeRate.judgeId}
                          className="px-3 py-1 text-xs font-semibold rounded-full bg-glass-dark text-text-primary border border-glass"
                          title={`${judgeRate.judgeName}: ${judgeRate.passed}/${judgeRate.totalEvaluations} passed`}
                        >
                          {judgeRate.judgeName}: {judgeRate.passRate.toFixed(1)}%
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-xs text-text-tertiary">
                        {allQuestionEvaluations.length} evaluation{allQuestionEvaluations.length !== 1 ? 's' : ''} •{' '}
                        {filteredSubmissions.length} submission{filteredSubmissions.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-text-primary mb-1">{questionText}</h3>
                  </div>
                  <svg
                    className={`w-6 h-6 text-text-tertiary transition-transform ${isExpanded ? 'transform rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>

              {/* Expanded Content */}
              {isExpanded && (
                <div className="border-t border-glass p-6 space-y-6">
                  {/* Judge Filter */}
                  <div>
                    <label className="block text-sm font-semibold text-text-secondary mb-2">
                      Filter by AI Judge
                    </label>
                    <select
                      value={judgeFilter}
                      onChange={(e) => setJudgeFilter(group.questionId, e.target.value)}
                      className="w-full md:w-64 px-4 py-2 glass-dark rounded-xl text-text-primary focus:outline-none focus:ring-2 focus:ring-orange"
                    >
                      <option value="">All Judges</option>
                      {availableJudges.map((judgeId) => {
                        const judgeName = judgeNames.get(judgeId) || `Judge ${judgeId.slice(0, 8)}...`;
                        return (
                          <option key={judgeId} value={judgeId}>
                            {judgeName}
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  {/* Submissions List */}
                  <div className="space-y-4">
                    {filteredSubmissions.length === 0 ? (
                      <div className="text-center py-8 text-text-tertiary">
                        No evaluations match the selected filter
                      </div>
                    ) : (
                      filteredSubmissions.map((submission) => (
                        <div key={submission.submissionId} className="glass rounded-xl p-6 space-y-4">
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <span className="text-xs font-semibold text-text-tertiary uppercase tracking-wider">
                                Submission {submission.submissionId.slice(0, 8)}...
                              </span>
                              <div className="mt-2 text-sm text-text-secondary">
                                <strong>Answer:</strong> {formatAnswer(submission.answer)}
                              </div>
                            </div>
                            <div className="text-xs text-text-tertiary">
                              {submission.evaluations.length} evaluation{submission.evaluations.length !== 1 ? 's' : ''}
                            </div>
                          </div>

                          {/* Evaluations for this submission */}
                          <div className="space-y-3">
                            {submission.evaluations.map((evaluation) => {
                              const judgeName = judgeNames.get(evaluation.judge_id) || `Judge ${evaluation.judge_id.slice(0, 8)}...`;
                              const isReasoningExpanded = expandedReasoning.has(evaluation.id);
                              const reasoningPreview = evaluation.reasoning
                                ? evaluation.reasoning.length > 150
                                  ? evaluation.reasoning.substring(0, 150) + '...'
                                  : evaluation.reasoning
                                : null;

                              return (
                                <div key={evaluation.id} className="p-4 glass-dark rounded-lg">
                                  <div className="flex items-start justify-between mb-2">
                                    <div className="flex items-center space-x-3">
                                      <span className="font-semibold text-text-primary">{judgeName}</span>
                                      <span
                                        className={`px-3 py-1 text-xs font-bold rounded-lg ${getVerdictColor(
                                          evaluation.verdict
                                        )} shadow-lg`}
                                      >
                                        {evaluation.verdict.toUpperCase()}
                                      </span>
                                    </div>
                                    <span className="text-xs text-text-tertiary">
                                      {new Date(evaluation.created_at).toLocaleDateString()}
                                    </span>
                                  </div>
                                  
                                  {evaluation.reasoning && (
                                    <div className="text-sm text-text-secondary mt-2">
                                      {isReasoningExpanded ? (
                                        <div className="whitespace-pre-wrap">{evaluation.reasoning}</div>
                                      ) : (
                                        <div>{reasoningPreview}</div>
                                      )}
                                      {evaluation.reasoning.length > 150 && (
                                        <button
                                          onClick={() => toggleReasoning(evaluation.id)}
                                          className="mt-2 text-xs text-text-primary hover:text-text-secondary underline transition-smooth"
                                        >
                                          {isReasoningExpanded ? 'Show less' : 'Show full reasoning'}
                                        </button>
                                      )}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ResultsTable;
