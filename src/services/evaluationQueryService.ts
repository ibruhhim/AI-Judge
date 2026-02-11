/**
 * Evaluation Query Service
 * 
 * Handles querying evaluation results from the database.
 * Provides filtering and statistics for evaluation data.
 */

import { supabase } from '../lib/supabase';
import { Evaluation, Verdict } from '../types/database';

/**
 * Retrieves evaluation results for a workspace with optional filters.
 * Includes related question and judge information for display.
 * 
 * @param workspaceId - The workspace to get evaluations from
 * @param filters - Optional filters to apply:
 *   - questionText: Filter by question text (searches in question_text field)
 *   - verdict: Filter by verdict type (pass/fail/inconclusive)
 *   - questionType: Filter by question type (multiple_choice/single_choice_with_reasoning/free_form)
 * @returns Array of evaluation results with question and judge info, ordered by creation date (newest first)
 */
export async function getEvaluationsWithFilters(
  workspaceId: string,
  filters?: {
    questionText?: string;
    verdict?: Verdict;
    questionType?: string | null;
  }
): Promise<Evaluation[]> {
  // Get all submissions in this workspace
  const { data: submissions } = await supabase
    .from('submissions')
    .select('id')
    .eq('workspace_id', workspaceId);

  if (!submissions || submissions.length === 0) {
    return [];
  }

  const submissionIds = submissions.map((s: { id: string }) => s.id);

  // Get all questions in these submissions
  // Build query with question type filter if provided
  let questionsQuery = supabase
    .from('questions')
    .select('id')
    .in('submission_id', submissionIds);

  // Apply question type filter if provided
  if (filters?.questionType !== undefined && filters?.questionType !== null && filters?.questionType !== '') {
    questionsQuery = questionsQuery.eq('question_type', filters.questionType);
  }

  const { data: questions } = await questionsQuery;

  if (!questions || questions.length === 0) {
    return [];
  }

  // If filtering by question text, find matching question IDs
  let questionIds: string[] | undefined;
  if (filters?.questionText) {
    let textQuery = supabase
      .from('questions')
      .select('id')
      .in('submission_id', submissionIds)
      .ilike('question_text', `%${filters.questionText}%`);
    
    // Also apply question type filter if provided
    if (filters?.questionType !== undefined && filters?.questionType !== null && filters?.questionType !== '') {
      textQuery = textQuery.eq('question_type', filters.questionType);
    }
    
    const { data: matchingQuestions } = await textQuery;
    
    if (matchingQuestions && matchingQuestions.length > 0) {
      questionIds = matchingQuestions.map((q: { id: string }) => q.id);
    } else {
      // No matching questions, return empty array
      return [];
    }
  } else {
    questionIds = questions.map((q: { id: string }) => q.id);
  }

  // Build query with filters
  let query = supabase
    .from('evaluations')
    .select('*')
    .in('question_id', questionIds);

  // Apply verdict filter
  if (filters?.verdict) {
    query = query.eq('verdict', filters.verdict);
  }

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

/**
 * Gets question text for a question ID
 */
export async function getQuestionText(questionId: string): Promise<string | null> {
  const { data, error } = await supabase
    .from('questions')
    .select('question_text')
    .eq('id', questionId)
    .single();

  if (error) {
    console.error('Error fetching question text:', error);
    return null;
  }
  return data?.question_text || null;
}

/**
 * Gets question texts for multiple question IDs in bulk
 */
export async function getQuestionTexts(questionIds: string[]): Promise<Map<string, string | null>> {
  if (questionIds.length === 0) {
    return new Map();
  }

  console.log('getQuestionTexts: Fetching texts for question IDs:', questionIds);

  const { data, error } = await supabase
    .from('questions')
    .select('id, question_text')
    .in('id', questionIds);

  if (error) {
    console.error('Error fetching question texts:', error);
    return new Map();
  }

  console.log('getQuestionTexts: Received data:', data);

  const texts = new Map<string, string | null>();
  if (data) {
    data.forEach((q: { id: string; question_text: string }) => {
      texts.set(q.id, q.question_text);
      console.log(`getQuestionTexts: Set text for question ${q.id}:`, q.question_text?.substring(0, 50));
    });
  }

  // Set null for any question IDs that weren't found
  questionIds.forEach((id) => {
    if (!texts.has(id)) {
      console.warn(`getQuestionTexts: Question ID ${id} not found in database`);
      texts.set(id, null);
    }
  });

  console.log('getQuestionTexts: Final texts map size:', texts.size);
  return texts;
}

/**
 * Gets judge name for a judge ID
 */
export async function getJudgeName(judgeId: string): Promise<string | null> {
  const { data, error } = await supabase
    .from('judges')
    .select('name')
    .eq('id', judgeId)
    .single();

  if (error) {
    console.error('Error fetching judge name:', error);
    return null;
  }
  return data?.name || null;
}

/**
 * Gets judge names for multiple judge IDs in bulk
 */
export async function getJudgeNames(judgeIds: string[]): Promise<Map<string, string | null>> {
  if (judgeIds.length === 0) {
    return new Map();
  }

  const { data, error } = await supabase
    .from('judges')
    .select('id, name')
    .in('id', judgeIds);

  if (error) {
    console.error('Error fetching judge names:', error);
    return new Map();
  }

  const names = new Map<string, string | null>();
  if (data) {
    data.forEach((j: { id: string; name: string }) => {
      names.set(j.id, j.name);
    });
  }

  // Set null for any judge IDs that weren't found
  judgeIds.forEach((id) => {
    if (!names.has(id)) {
      names.set(id, null);
    }
  });

  return names;
}

/**
 * Calculates the pass rate percentage from a list of evaluations.
 * Pass rate is calculated per question, then averaged across all questions.
 * 
 * @param evaluations - Array of evaluation results
 * @returns Pass rate as a percentage (0-100)
 */
export function calculatePassRate(evaluations: Evaluation[]): number {
  if (evaluations.length === 0) return 0;
  
  // Group evaluations by question_id
  const questionGroups = new Map<string, Evaluation[]>();
  evaluations.forEach((evaluation) => {
    const questionId = evaluation.question_id;
    if (!questionGroups.has(questionId)) {
      questionGroups.set(questionId, []);
    }
    questionGroups.get(questionId)!.push(evaluation);
  });

  // Calculate pass rate for each question
  const questionPassRates: number[] = [];
  questionGroups.forEach((questionEvaluations) => {
    const passed = questionEvaluations.filter((e) => e.verdict === 'pass').length;
    const passRate = (passed / questionEvaluations.length) * 100;
    questionPassRates.push(passRate);
  });

  // Average pass rates across all questions
  if (questionPassRates.length === 0) return 0;
  const averagePassRate = questionPassRates.reduce((sum, rate) => sum + rate, 0) / questionPassRates.length;
  return averagePassRate;
}

/**
 * Deletes an evaluation result.
 * 
 * @param evaluationId - The ID of the evaluation to delete
 */
export async function deleteEvaluation(evaluationId: string): Promise<void> {
  const { error } = await supabase.from('evaluations').delete().eq('id', evaluationId);

  if (error) throw error;
}

/**
 * Deletes all evaluations for a specific question.
 * Useful when you want to re-run evaluations for a question.
 * 
 * @param questionId - The ID of the question to delete evaluations for
 */
export async function deleteEvaluationsForQuestion(questionId: string): Promise<void> {
  const { error } = await supabase
    .from('evaluations')
    .delete()
    .eq('question_id', questionId);

  if (error) throw error;
}

/**
 * Deletes all evaluations for a specific judge.
 * Useful when you want to remove all evaluations from a deleted judge.
 * 
 * @param judgeId - The ID of the judge to delete evaluations for
 */
export async function deleteEvaluationsForJudge(judgeId: string): Promise<void> {
  const { error } = await supabase.from('evaluations').delete().eq('judge_id', judgeId);

  if (error) throw error;
}

/**
 * Gets answers for multiple questions in bulk.
 * Returns a map of question_id -> answer_json.
 * 
 * @param questionIds - Array of question IDs to fetch answers for
 * @returns Map of question ID to answer JSON (or null if no answer exists)
 */
export async function getAnswersForQuestions(questionIds: string[]): Promise<Map<string, unknown>> {
  if (questionIds.length === 0) {
    return new Map();
  }

  const { data, error } = await supabase
    .from('answers')
    .select('question_id, answer_json')
    .in('question_id', questionIds);

  if (error) {
    return new Map();
  }

  const answers = new Map<string, unknown>();
  if (data) {
    data.forEach((a: { question_id: string; answer_json: unknown }) => {
      answers.set(a.question_id, a.answer_json);
    });
  }

  // Set null for any question IDs that don't have answers
  questionIds.forEach((id) => {
    if (!answers.has(id)) {
      answers.set(id, null);
    }
  });

  return answers;
}
