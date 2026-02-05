/**
 * AI Judge Management Service
 * 
 * Handles all operations related to AI Judges:
 * - Creating and retrieving AI judge configurations (prompts, models)
 * - Assigning/unassigning judges to questions
 * - Managing judge-question relationships
 * 
 * AI Judges are stateless evaluators that grade question-answer pairs
 * using LLM prompts. They are shared across all workspaces for a user.
 */

import { supabase, getCurrentUserId } from '../lib/supabase';
import { Judge } from '../types/database';

/**
 * Retrieves all AI judges created by the current user.
 * Judges are ordered by creation date (newest first).
 */
export async function getAllUserJudges(): Promise<Judge[]> {
  const userId = getCurrentUserId();
  const { data, error } = await supabase
    .from('judges')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

/**
 * Creates a new AI judge configuration.
 * 
 * @param name - Display name for the judge
 * @param systemPrompt - The prompt that defines how the judge evaluates answers
 * @param model - OpenAI model to use (e.g., 'gpt-4', 'gpt-3.5-turbo')
 * @returns The created judge configuration
 */
export async function createNewJudge(
  name: string,
  systemPrompt: string,
  model: string
): Promise<Judge> {
  const userId = getCurrentUserId();
  const { data, error } = await supabase
    .from('judges')
    .insert({
      user_id: userId,
      name,
      system_prompt: systemPrompt,
      model,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Assigns an AI judge to evaluate a specific question.
 * If multiple questions have the same question_text, assigns the judge to ALL of them.
 * This ensures all submissions with the same question get evaluated.
 * 
 * @param judgeId - The ID of the AI judge
 * @param questionId - The ID of the question to assign the judge to (will find all questions with same text)
 */
export async function assignJudgeToQuestion(
  judgeId: string,
  questionId: string
): Promise<void> {
  // First, get the question text for this question
  const { data: question, error: questionError } = await supabase
    .from('questions')
    .select('question_text, submission_id')
    .eq('id', questionId)
    .single();

  if (questionError || !question) {
    throw new Error(`Question not found: ${questionError?.message || 'Unknown error'}`);
  }

  // Get the submission's workspace_id
  const { data: submission, error: subError } = await supabase
    .from('submissions')
    .select('workspace_id')
    .eq('id', question.submission_id)
    .single();

  if (subError || !submission) {
    throw new Error(`Submission not found: ${subError?.message || 'Unknown error'}`);
  }

  // Find ALL questions in this workspace with the same question_text (case-insensitive, trimmed)
  const normalizedText = question.question_text.trim().toLowerCase();
  
  // Get all submissions in the workspace
  const { data: workspaceSubmissions, error: wsError } = await supabase
    .from('submissions')
    .select('id')
    .eq('workspace_id', submission.workspace_id);

  if (wsError || !workspaceSubmissions) {
    throw new Error(`Failed to get workspace submissions: ${wsError?.message || 'Unknown error'}`);
  }

  const submissionIds = workspaceSubmissions.map((s: { id: string }) => s.id);

  // Get all questions with their text in this workspace
  const { data: allQuestions, error: allQError } = await supabase
    .from('questions')
    .select('id, question_text')
    .in('submission_id', submissionIds);

  if (allQError) {
    throw new Error(`Failed to get all questions: ${allQError.message}`);
  }

  // Filter to questions with matching normalized text
  const questionsToAssign = (allQuestions || [])
    .filter((q: { id: string; question_text: string }) => 
      q.question_text.trim().toLowerCase() === normalizedText
    )
    .map((q: { id: string }) => q.id);

  console.log(`assignJudgeToQuestion: Assigning judge ${judgeId} to ${questionsToAssign.length} questions with text "${question.question_text.substring(0, 50)}..."`);

  // Assign judge to all matching questions (use upsert to avoid duplicates)
  if (questionsToAssign.length > 0) {
    const assignments = questionsToAssign.map((qId: string) => ({
      judge_id: judgeId,
      question_id: qId,
    }));

    const { error: insertError } = await supabase
      .from('judge_assignments')
      .upsert(assignments, {
        onConflict: 'judge_id,question_id',
      });

    if (insertError) {
      throw new Error(`Failed to assign judge: ${insertError.message}`);
    }
  }
}

/**
 * Removes an AI judge assignment from a question.
 * If multiple questions have the same question_text, unassigns from ALL of them.
 * This ensures consistency when unassigning judges.
 * 
 * @param judgeId - The ID of the AI judge
 * @param questionId - The ID of the question to unassign (will find all questions with same text)
 */
export async function unassignJudgeFromQuestion(
  judgeId: string,
  questionId: string
): Promise<void> {
  // First, get the question text for this question
  const { data: question, error: questionError } = await supabase
    .from('questions')
    .select('question_text, submission_id')
    .eq('id', questionId)
    .single();

  if (questionError || !question) {
    throw new Error(`Question not found: ${questionError?.message || 'Unknown error'}`);
  }

  // Get the submission's workspace_id
  const { data: submission, error: subError } = await supabase
    .from('submissions')
    .select('workspace_id')
    .eq('id', question.submission_id)
    .single();

  if (subError || !submission) {
    throw new Error(`Submission not found: ${subError?.message || 'Unknown error'}`);
  }

  // Find ALL questions in this workspace with the same question_text (case-insensitive, trimmed)
  const normalizedText = question.question_text.trim().toLowerCase();
  
  // Get all submissions in the workspace
  const { data: workspaceSubmissions, error: wsError } = await supabase
    .from('submissions')
    .select('id')
    .eq('workspace_id', submission.workspace_id);

  if (wsError || !workspaceSubmissions) {
    throw new Error(`Failed to get workspace submissions: ${wsError?.message || 'Unknown error'}`);
  }

  const submissionIds = workspaceSubmissions.map((s: { id: string }) => s.id);

  // Get all questions with their text in this workspace
  const { data: allQuestions, error: allQError } = await supabase
    .from('questions')
    .select('id, question_text')
    .in('submission_id', submissionIds);

  if (allQError) {
    throw new Error(`Failed to get all questions: ${allQError.message}`);
  }

  // Filter to questions with matching normalized text
  const questionsToUnassign = (allQuestions || [])
    .filter((q: { id: string; question_text: string }) => 
      q.question_text.trim().toLowerCase() === normalizedText
    )
    .map((q: { id: string }) => q.id);

  console.log(`unassignJudgeFromQuestion: Unassigning judge ${judgeId} from ${questionsToUnassign.length} questions with text "${question.question_text.substring(0, 50)}..."`);

  // Unassign judge from all matching questions
  if (questionsToUnassign.length > 0) {
    const { error: deleteError } = await supabase
      .from('judge_assignments')
      .delete()
      .eq('judge_id', judgeId)
      .in('question_id', questionsToUnassign);

    if (deleteError) {
      throw new Error(`Failed to unassign judge: ${deleteError.message}`);
    }
  }
}

/**
 * Gets all judge-question assignments for a set of questions.
 * Returns a Set of strings in format "judgeId-questionId" for quick lookup.
 * 
 * @param questionIds - Array of question IDs to check assignments for
 * @returns Set of assignment keys (format: "judgeId-questionId")
 */
export async function getJudgeAssignmentsForQuestions(
  questionIds: string[]
): Promise<Set<string>> {
  if (questionIds.length === 0) return new Set();

  const { data } = await supabase
    .from('judge_assignments')
    .select('judge_id, question_id')
    .in('question_id', questionIds);

  if (!data) return new Set();

  // Return as Set for O(1) lookup performance
  return new Set(
    data.map((a: { judge_id: string; question_id: string }) => `${a.judge_id}-${a.question_id}`)
  );
}

/**
 * Updates an existing AI judge configuration.
 * Only the owner of the judge can update it.
 * 
 * @param judgeId - The ID of the judge to update
 * @param name - Updated display name for the judge
 * @param systemPrompt - Updated prompt that defines how the judge evaluates answers
 * @param model - Updated OpenAI model to use
 * @returns The updated judge configuration
 */
export async function updateJudge(
  judgeId: string,
  name: string,
  systemPrompt: string,
  model: string
): Promise<Judge> {
  const userId = getCurrentUserId();

  // Verify the judge belongs to the current user before updating
  const { data: judge, error: checkError } = await supabase
    .from('judges')
    .select('id')
    .eq('id', judgeId)
    .eq('user_id', userId)
    .single();

  if (checkError || !judge) {
    throw new Error('Judge not found or access denied');
  }

  // Update the judge
  const { data, error } = await supabase
    .from('judges')
    .update({
      name,
      system_prompt: systemPrompt,
      model,
    })
    .eq('id', judgeId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Deletes an AI judge and all its assignments.
 * Note: This will cascade delete judge_assignments due to foreign key constraints.
 * Existing evaluations will remain (they reference the judge_id but judge is deleted).
 * 
 * @param judgeId - The ID of the AI judge to delete
 */
export async function deleteJudge(judgeId: string): Promise<void> {
  const userId = getCurrentUserId();

  // Verify the judge belongs to the current user before deleting
  const { data: judge, error: checkError } = await supabase
    .from('judges')
    .select('id')
    .eq('id', judgeId)
    .eq('user_id', userId)
    .single();

  if (checkError || !judge) {
    throw new Error('Judge not found or access denied');
  }

  // Delete the judge (cascade will handle judge_assignments)
  const { error } = await supabase.from('judges').delete().eq('id', judgeId);

  if (error) throw error;
}

/**
 * Gets the selected judge IDs for a workspace.
 * Returns an empty array if no judges are selected.
 * 
 * @param workspaceId - The ID of the workspace
 * @returns Array of selected judge IDs
 */
export async function getSelectedJudgesForWorkspace(workspaceId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from('workspace_judge_selections')
    .select('judge_id')
    .eq('workspace_id', workspaceId);

  if (error) {
    // If table doesn't exist, return empty array (graceful degradation)
    if (error.code === '42P01') {
      console.warn('workspace_judge_selections table does not exist. Please create it.');
      return [];
    }
    throw error;
  }

  return (data || []).map((row: { judge_id: string }) => row.judge_id);
}

/**
 * Sets the selected judges for a workspace.
 * Replaces any existing selections.
 * 
 * @param workspaceId - The ID of the workspace
 * @param judgeIds - Array of judge IDs to select
 */
export async function setSelectedJudgesForWorkspace(
  workspaceId: string,
  judgeIds: string[]
): Promise<void> {
  // First, delete all existing selections for this workspace
  const { error: deleteError } = await supabase
    .from('workspace_judge_selections')
    .delete()
    .eq('workspace_id', workspaceId);

  if (deleteError) {
    // If table doesn't exist, try to create it (this will fail, but we'll handle gracefully)
    if (deleteError.code === '42P01') {
      console.warn('workspace_judge_selections table does not exist. Please create it.');
      return;
    }
    throw deleteError;
  }

  // If no judges to select, we're done
  if (judgeIds.length === 0) {
    return;
  }

  // Insert new selections
  const selections = judgeIds.map((judgeId) => ({
    workspace_id: workspaceId,
    judge_id: judgeId,
  }));

  const { error: insertError } = await supabase
    .from('workspace_judge_selections')
    .insert(selections);

  if (insertError) {
    throw insertError;
  }
}

/**
 * Toggles a judge's selection status for a workspace.
 * 
 * @param workspaceId - The ID of the workspace
 * @param judgeId - The ID of the judge to toggle
 * @returns Whether the judge is now selected (true) or deselected (false)
 */
export async function toggleJudgeSelectionForWorkspace(
  workspaceId: string,
  judgeId: string
): Promise<boolean> {
  // Check if currently selected
  const { data: existing } = await supabase
    .from('workspace_judge_selections')
    .select('judge_id')
    .eq('workspace_id', workspaceId)
    .eq('judge_id', judgeId)
    .single();

  if (existing) {
    // Deselect
    const { error } = await supabase
      .from('workspace_judge_selections')
      .delete()
      .eq('workspace_id', workspaceId)
      .eq('judge_id', judgeId);

    if (error) {
      if (error.code === '42P01') {
        console.warn('workspace_judge_selections table does not exist. Please create it.');
        return false;
      }
      throw error;
    }
    return false;
  } else {
    // Select
    const { error } = await supabase
      .from('workspace_judge_selections')
      .insert({
        workspace_id: workspaceId,
        judge_id: judgeId,
      });

    if (error) {
      if (error.code === '42P01') {
        console.warn('workspace_judge_selections table does not exist. Please create it.');
        return false;
      }
      throw error;
    }
    return true;
  }
}