/**
 * Question Data Service
 * 
 * Handles querying questions from the database.
 * Questions belong to submissions, which belong to workspaces.
 */

import { supabase } from '../lib/supabase';
import { Question } from '../types/database';

/**
 * Retrieves all questions from all submissions in a workspace.
 * 
 * @param workspaceId - The workspace to get questions from
 * @returns Array of all questions in the workspace
 */
export async function getQuestionsByWorkspace(workspaceId: string): Promise<Question[]> {
  console.log('getQuestionsByWorkspace: Fetching questions for workspace:', workspaceId);
  
  // First, get all submissions in this workspace
  const { data: submissions, error: subError } = await supabase
    .from('submissions')
    .select('id')
    .eq('workspace_id', workspaceId);

  if (subError) {
    console.error('getQuestionsByWorkspace: Error fetching submissions:', subError);
    throw subError;
  }

  console.log('getQuestionsByWorkspace: Found submissions:', submissions?.length || 0);

  if (!submissions || submissions.length === 0) {
    console.log('getQuestionsByWorkspace: No submissions found, returning empty array');
    return [];
  }

  // Then get all questions from those submissions
  const submissionIds = submissions.map((s: { id: string }) => s.id);
  console.log('getQuestionsByWorkspace: Submission IDs:', submissionIds);
  
  const { data, error } = await supabase
    .from('questions')
    .select('*')
    .in('submission_id', submissionIds);

  if (error) {
    console.error('getQuestionsByWorkspace: Error fetching questions:', error);
    throw error;
  }

  console.log('getQuestionsByWorkspace: Found questions:', data?.length || 0);
  
  // Deduplicate questions by question_text (keep first occurrence)
  // If multiple submissions have the same question, show only one unique question
  const uniqueQuestions = new Map<string, Question>();
  for (const question of data || []) {
    const questionText = question.question_text.trim().toLowerCase();
    if (!uniqueQuestions.has(questionText)) {
      uniqueQuestions.set(questionText, question);
    }
  }
  
  const deduplicated = Array.from(uniqueQuestions.values());
  console.log(`getQuestionsByWorkspace: Deduplicated from ${data?.length || 0} to ${deduplicated.length} unique questions`);
  return deduplicated;
}

/**
 * Deletes a question and all its associated data.
 * This will cascade delete (via foreign key constraints):
 * - The answer to this question
 * - All evaluations for this question
 * - All judge assignments for this question
 * 
 * @param questionId - The ID of the question to delete
 */
export async function deleteQuestion(questionId: string): Promise<void> {
  console.log('deleteQuestion: Deleting question:', questionId);
  
  const { error } = await supabase
    .from('questions')
    .delete()
    .eq('id', questionId);

  if (error) {
    console.error('deleteQuestion: Error deleting question:', error);
    throw new Error(`Failed to delete question: ${error.message}`);
  }

  console.log('deleteQuestion: Successfully deleted question and all related data');
}
