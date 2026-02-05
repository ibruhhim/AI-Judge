/// <reference path="./deno.d.ts" />

/**
 * Database Operations Module
 * 
 * Handles all database queries needed for the evaluation process.
 * Functions fetch data from Supabase tables and return typed results.
 * All functions throw errors on database failures for proper error handling.
 */

// @ts-ignore - ESM imports work in Deno runtime
import { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { JudgeData, QuestionData, Assignment } from './types.ts';

/**
 * Retrieves all submission IDs for a given workspace.
 * 
 * @param supabase - Supabase client instance
 * @param workspaceId - The workspace to get submissions from
 * @returns Array of submission IDs
 * @throws Error if no submissions found or database error occurs
 */
export async function getSubmissionsForWorkspace(
  supabase: SupabaseClient,
  workspaceId: string
): Promise<string[]> {
  const { data, error } = await supabase
    .from('submissions')
    .select('id')
    .eq('workspace_id', workspaceId);

  if (error) throw error;
  if (!data || data.length === 0) {
    throw new Error('No submissions found in workspace');
  }

  return data.map((s: { id: string }) => s.id);
}

/**
 * Retrieves all questions for a set of submissions.
 * 
 * @param supabase - Supabase client instance
 * @param submissionIds - Array of submission IDs to get questions for
 * @returns Array of question data (without answers - those are fetched separately)
 * @throws Error if no questions found or database error occurs
 */
export async function getQuestionsForSubmissions(
  supabase: SupabaseClient,
  submissionIds: string[]
): Promise<QuestionData[]> {
  const { data, error } = await supabase
    .from('questions')
    .select('id, question_text, question_type, submission_id')
    .in('submission_id', submissionIds);

  if (error) throw error;
  if (!data || data.length === 0) {
    throw new Error('No questions found');
  }

  return data.map((q: { id: string; question_text: string; question_type: string | null; submission_id: string }) => ({
    id: q.id,
    question_text: q.question_text,
    question_type: q.question_type as QuestionData['question_type'],
    answer_json: null,
    submission_id: q.submission_id,
  }));
}

/**
 * Retrieves answers for a set of questions and returns them as a Map.
 * Uses a Map for O(1) lookup performance when matching answers to questions.
 * 
 * @param supabase - Supabase client instance
 * @param questionIds - Array of question IDs to get answers for
 * @returns Map where key is question_id and value is answer_json
 */
export async function getAnswersForQuestions(
  supabase: SupabaseClient,
  questionIds: string[]
): Promise<Map<string, unknown>> {
  const { data, error } = await supabase
    .from('answers')
    .select('question_id, answer_json')
    .in('question_id', questionIds);

  if (error) throw error;

  const answerMap = new Map<string, unknown>();
  if (data) {
    data.forEach((a: { question_id: string; answer_json: unknown }) => {
      answerMap.set(a.question_id, a.answer_json);
    });
  }

  return answerMap;
}

/**
 * Retrieves all judge-question assignments for a set of questions.
 * These assignments determine which judges will evaluate which questions.
 * 
 * @param supabase - Supabase client instance
 * @param questionIds - Array of question IDs to get assignments for
 * @returns Array of judge-question assignments
 * @throws Error if no assignments found or database error occurs
 */
export async function getJudgeAssignments(
  supabase: SupabaseClient,
  questionIds: string[]
): Promise<Assignment[]> {
  if (questionIds.length === 0) {
    return [];
  }
  
  const { data, error } = await supabase
    .from('judge_assignments')
    .select('judge_id, question_id')
    .in('question_id', questionIds);

  if (error) throw error;
  if (!data || data.length === 0) {
    throw new Error('No judge assignments found');
  }

  return data as Assignment[];
}

/**
 * Retrieves AI judges for a specific user.
 * Only returns judges that are owned by the specified user.
 * 
 * @param supabase - Supabase client instance
 * @param judgeIds - Array of judge IDs to fetch
 * @param userId - The user who owns the judges
 * @returns Array of judge configurations
 * @throws Error if no judges found or database error occurs
 */
export async function getJudgesForUser(
  supabase: SupabaseClient,
  judgeIds: string[],
  userId: string
): Promise<JudgeData[]> {
  if (judgeIds.length === 0) {
    return [];
  }
  
  const { data, error } = await supabase
    .from('judges')
    .select('id, name, system_prompt, model')
    .in('id', judgeIds)
    .eq('user_id', userId);

  if (error) throw error;
  if (!data || data.length === 0) {
    throw new Error('No judges found');
  }

  return data as JudgeData[];
}

/**
 * Deletes all evaluations for questions in a workspace that are not in the current assignments.
 * This ensures that when re-running evaluations, old evaluations from removed judge assignments are cleaned up.
 * 
 * @param supabase - Supabase client instance
 * @param questionIds - Array of question IDs that currently have assignments
 * @param currentAssignments - Array of current judge-question assignments
 * @throws Error if database delete fails
 */
export async function deleteOldEvaluations(
  supabase: SupabaseClient,
  questionIds: string[],
  currentAssignments: Assignment[]
): Promise<void> {
  if (questionIds.length === 0) {
    // If no questions, delete all evaluations for these questions (should be none, but safe)
    return;
  }

  // Create a set of valid (question_id, judge_id) pairs from current assignments
  const validPairs = new Set<string>();
  currentAssignments.forEach((a) => {
    validPairs.add(`${a.question_id}:${a.judge_id}`);
  });

  // Get all evaluations for these questions
  const { data: existingEvaluations, error: fetchError } = await supabase
    .from('evaluations')
    .select('id, question_id, judge_id')
    .in('question_id', questionIds);

  if (fetchError) throw fetchError;

  if (!existingEvaluations || existingEvaluations.length === 0) {
    // No existing evaluations to delete
    return;
  }

  // Find evaluations that are NOT in the current assignments
  const evaluationsToDelete = existingEvaluations.filter((e) => {
    const pairKey = `${e.question_id}:${e.judge_id}`;
    return !validPairs.has(pairKey);
  });

  if (evaluationsToDelete.length === 0) {
    // All evaluations are still valid
    return;
  }

  // Delete evaluations that are no longer part of current assignments
  const idsToDelete = evaluationsToDelete.map((e) => e.id);
  const { error: deleteError } = await supabase
    .from('evaluations')
    .delete()
    .in('id', idsToDelete);

  if (deleteError) throw deleteError;
  
  console.log(`[run-evaluations] Deleted ${idsToDelete.length} old evaluations that are no longer in current assignments`);
}

/**
 * Saves an evaluation result to the database.
 * Uses upsert to handle re-runs - if an evaluation already exists for
 * this question-judge pair, it will be updated instead of creating a duplicate.
 * 
 * @param supabase - Supabase client instance
 * @param submissionId - The submission this evaluation belongs to
 * @param questionId - The question that was evaluated
 * @param judgeId - The judge that performed the evaluation
 * @param verdict - The evaluation verdict (pass/fail/inconclusive)
 * @param reasoning - The judge's explanation for the verdict
 * @throws Error if database save fails
 */
export async function saveEvaluation(
  supabase: SupabaseClient,
  submissionId: string,
  questionId: string,
  judgeId: string,
  verdict: 'pass' | 'fail' | 'inconclusive',
  reasoning: string | null
): Promise<void> {
  const { error } = await supabase
    .from('evaluations')
    .upsert(
      {
        submission_id: submissionId,
        question_id: questionId,
        judge_id: judgeId,
        verdict,
        reasoning,
      },
      {
        onConflict: 'question_id,judge_id',
      }
    );

  if (error) throw error;
}
