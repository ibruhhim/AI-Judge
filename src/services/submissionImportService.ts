/**
 * Submission Import Service
 * 
 * Handles importing and parsing JSON submission files.
 * Creates submissions, questions, and answers in the database
 * from uploaded JSON data.
 */

import { supabase } from '../lib/supabase';
import { Submission } from '../types/database';

/**
 * Structure of a question as parsed from JSON
 * Standard format: questions are nested in { rev: number, data: { id, questionText, questionType } }
 */
interface ParsedQuestion {
  id: string;
  text: string;
  type: string | null;
}

/**
 * Structure of a submission as parsed from JSON
 * Standard format:
 * {
 *   "id": string,
 *   "queueId": string,
 *   "labelingTaskId": string,
 *   "createdAt": number,
 *   "questions": [{ rev: number, data: { id, questionText, questionType } }],
 *   "answers": { [questionId]: { choice, reasoning, ... } }
 * }
 */
interface ParsedSubmission {
  questions: ParsedQuestion[];
  answers: Record<string, unknown>;
}

/**
 * Creates a submission in the database along with all its questions and answers.
 * 
 * @param workspaceId - The workspace to add the submission to
 * @param data - Parsed submission data containing questions and answers
 * @returns The created submission record
 */
export async function createSubmissionWithQuestionsAndAnswers(
  workspaceId: string,
  data: ParsedSubmission
): Promise<Submission> {
  console.log('createSubmissionWithQuestionsAndAnswers: Starting with workspace:', workspaceId);
  console.log('createSubmissionWithQuestionsAndAnswers: Questions count:', data.questions?.length || 0);
  
  // Validate input
  if (!data.questions || !Array.isArray(data.questions)) {
    throw new Error('Invalid submission data: "questions" must be an array');
  }

  if (data.questions.length === 0) {
    throw new Error('Invalid submission data: "questions" array cannot be empty');
  }

  // Create the submission record
  const { data: submission, error: subError } = await supabase
    .from('submissions')
    .insert({ workspace_id: workspaceId })
    .select()
    .single();

  if (subError) {
    console.error('createSubmissionWithQuestionsAndAnswers: Error creating submission:', subError);
    throw new Error(`Failed to create submission: ${subError.message || JSON.stringify(subError)}`);
  }

  console.log('createSubmissionWithQuestionsAndAnswers: Created submission:', submission.id);

  // Create all questions for this submission
  for (let i = 0; i < data.questions.length; i++) {
    const question = data.questions[i];
    
    // Validate question structure
    if (!question || typeof question !== 'object') {
      throw new Error(`Invalid question at index ${i}: question must be an object`);
    }
    
    if (!question.text || typeof question.text !== 'string') {
      throw new Error(`Invalid question at index ${i}: question must have a "text" property (string)`);
    }

    console.log(`createSubmissionWithQuestionsAndAnswers: Creating question ${i + 1}/${data.questions.length}:`, question.text.substring(0, 50));

    const { data: questionData, error: qError } = await supabase
      .from('questions')
      .insert({
        submission_id: submission.id,
        question_text: question.text,
        question_type: question.type || null,
      })
      .select()
      .single();

    if (qError) {
      console.error(`createSubmissionWithQuestionsAndAnswers: Error creating question ${i + 1}:`, qError);
      throw new Error(`Failed to create question "${question.text.substring(0, 50)}...": ${qError.message || JSON.stringify(qError)}`);
    }

    // Create answer if one exists for this question
    // Answers can be keyed by question ID or question text
    const answer = data.answers?.[question.id] || data.answers?.[question.text];
    if (answer !== undefined) {
      const { error: aError } = await supabase.from('answers').insert({
        question_id: questionData.id,
        answer_json: answer,
      });

      if (aError) {
        console.error(`createSubmissionWithQuestionsAndAnswers: Error creating answer for question ${i + 1}:`, aError);
        // Don't throw here - answer creation is optional, but log the error
        console.warn(`Warning: Could not create answer for question "${question.text.substring(0, 50)}...": ${aError.message}`);
      }
    }
  }

  console.log('createSubmissionWithQuestionsAndAnswers: Successfully created submission with all questions');
  return submission;
}

/**
 * Parses JSON file data into an array of submission objects.
 * 
 * Standard format (required):
 * [
 *   {
 *     "id": "sub_001",
 *     "queueId": "queue_demo",
 *     "labelingTaskId": "task_1",
 *     "createdAt": 1706745600000,
 *     "questions": [
 *       {
 *         "rev": 1,
 *         "data": {
 *           "id": "q_logic_1",
 *           "questionType": "single_choice_with_reasoning",
 *           "questionText": "Is the capital of France London?"
 *         }
 *       }
 *     ],
 *     "answers": {
 *       "q_logic_1": {
 *         "choice": "no",
 *         "reasoning": "The capital of France is Paris..."
 *       }
 *     }
 *   }
 * ]
 * 
 * @param jsonData - Raw JSON data from uploaded file (must be array or single object)
 * @returns Array of parsed submission objects
 * @throws Error if the format doesn't match the standard structure
 */
export function parseSubmissionJsonFile(jsonData: unknown): ParsedSubmission[] {
  console.log('parseSubmissionJsonFile: Input data:', jsonData);
  
  // Normalize to array format
  const data = Array.isArray(jsonData) ? jsonData : [jsonData];
  console.log('parseSubmissionJsonFile: Normalized to array, length:', data.length);
  
  // Extract questions and answers from each submission
  const parsed = data.map((item, index) => {
    if (!item || typeof item !== 'object') {
      throw new Error(`Submission ${index + 1}: Invalid submission object. Expected an object with "questions" and "answers" properties.`);
    }

    const submission = item as Record<string, unknown>;
    const rawQuestions = submission.questions;
    const answers = submission.answers || {};

    // Validate questions array exists
    if (!Array.isArray(rawQuestions)) {
      const foundType = rawQuestions === undefined ? 'undefined' : typeof rawQuestions;
      throw new Error(`Submission ${index + 1}: "questions" must be an array. Found: ${foundType}`);
    }

    if (rawQuestions.length === 0) {
      throw new Error(`Submission ${index + 1}: "questions" array cannot be empty.`);
    }
    
    // Transform questions from standard nested format: { rev: number, data: { id, questionText, questionType } }
    const questions = rawQuestions.map((q: unknown, qIndex: number) => {
      // Validate question structure
      if (!q || typeof q !== 'object') {
        throw new Error(`Submission ${index + 1}, Question ${qIndex + 1}: Invalid question. Expected an object with "rev" and "data" properties.`);
      }

      const question = q as Record<string, unknown>;

      // Must have 'data' property
      if (!('data' in question) || !question.data) {
        throw new Error(
          `Submission ${index + 1}, Question ${qIndex + 1}: Missing "data" property. ` +
          `Expected format: { "rev": 1, "data": { "id": "...", "questionText": "...", "questionType": "..." } }`
        );
      }

      // Validate 'data' is an object
      if (typeof question.data !== 'object' || question.data === null) {
        throw new Error(`Submission ${index + 1}, Question ${qIndex + 1}: "data" must be an object.`);
      }

      const questionData = question.data as Record<string, unknown>;

      // Extract required fields from data
      const id = questionData.id;
      const questionText = questionData.questionText;
      const questionType = questionData.questionType;

      // Validate required fields
      if (!id || typeof id !== 'string') {
        throw new Error(`Submission ${index + 1}, Question ${qIndex + 1}: "data.id" must be a non-empty string.`);
      }

      if (!questionText || typeof questionText !== 'string') {
        throw new Error(`Submission ${index + 1}, Question ${qIndex + 1}: "data.questionText" must be a non-empty string.`);
      }

      // questionType is optional but should be a string if provided
      if (questionType !== undefined && questionType !== null && typeof questionType !== 'string') {
        throw new Error(`Submission ${index + 1}, Question ${qIndex + 1}: "data.questionType" must be a string or null.`);
      }

      return {
        id: id as string,
        text: questionText as string,
        type: (questionType as string | null) || null,
      };
    });
    
    console.log(`parseSubmissionJsonFile: Submission ${index + 1}: ${questions.length} questions, ${Object.keys(answers).length} answers`);
    return {
      questions,
      answers: answers as Record<string, unknown>,
    };
  });
  
  console.log('parseSubmissionJsonFile: Total parsed submissions:', parsed.length);
  return parsed;
}

/**
 * Deletes a submission and all its associated data.
 * This will cascade delete:
 * - All questions in the submission
 * - All answers to those questions
 * - All evaluations for those questions
 * - All judge assignments for those questions
 * 
 * @param submissionId - The ID of the submission to delete
 */
export async function deleteSubmission(submissionId: string): Promise<void> {
  // Delete the submission (cascade will handle questions, answers, evaluations, assignments)
  const { error } = await supabase.from('submissions').delete().eq('id', submissionId);

  if (error) throw error;
}

/**
 * Deletes all submissions for a workspace.
 * This will cascade delete (via foreign key constraints):
 * - All questions in those submissions
 * - All answers to those questions
 * - All evaluations for those questions
 * - All judge assignments for those questions
 * 
 * @param workspaceId - The workspace to clear all submissions from
 */
export async function deleteAllSubmissionsForWorkspace(workspaceId: string): Promise<void> {
  console.log('deleteAllSubmissionsForWorkspace: Deleting all submissions for workspace:', workspaceId);
  
  // Get all submission IDs first to log how many we're deleting
  const { data: submissions, error: fetchError } = await supabase
    .from('submissions')
    .select('id')
    .eq('workspace_id', workspaceId);

  if (fetchError) {
    console.error('deleteAllSubmissionsForWorkspace: Error fetching submissions:', fetchError);
    throw new Error(`Failed to fetch submissions: ${fetchError.message}`);
  }

  const submissionCount = submissions?.length || 0;
  console.log(`deleteAllSubmissionsForWorkspace: Found ${submissionCount} submission(s) to delete`);

  if (submissionCount === 0) {
    console.log('deleteAllSubmissionsForWorkspace: No submissions to delete');
    return;
  }

  // Delete all submissions (cascade will handle related data)
  const { error } = await supabase
    .from('submissions')
    .delete()
    .eq('workspace_id', workspaceId);

  if (error) {
    console.error('deleteAllSubmissionsForWorkspace: Error deleting submissions:', error);
    throw new Error(`Failed to delete submissions: ${error.message}`);
  }

  console.log(`deleteAllSubmissionsForWorkspace: Successfully deleted ${submissionCount} submission(s) and all related data`);
}

/**
 * Gets all submissions for a workspace.
 * 
 * @param workspaceId - The workspace to get submissions from
 * @returns Array of all submissions in the workspace
 */
export async function getSubmissionsByWorkspace(workspaceId: string): Promise<Submission[]> {
  const { data, error } = await supabase
    .from('submissions')
    .select('*')
    .eq('workspace_id', workspaceId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}
