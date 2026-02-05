/// <reference path="./deno.d.ts" />

/**
 * Core Evaluation Logic Module
 * 
 * Processes a single judge-question assignment by:
 * 1. Calling OpenAI API with the judge's prompt
 * 2. Parsing and validating the response
 * 3. Saving the evaluation result to the database
 * 4. Handling errors gracefully (saves as inconclusive)
 */

import { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { JudgeData, QuestionData, Assignment, EvaluationResult } from './types.ts';
import { callOpenAI } from './openAI.ts';
import { saveEvaluation } from './database.ts';

/**
 * Evaluates a single question using a specific AI judge.
 * 
 * This is the core evaluation function that:
 * - Calls OpenAI with the judge's prompt and question/answer
 * - Saves the result to the database
 * - Handles errors by saving an 'inconclusive' verdict with error details
 * 
 * @param supabase - Supabase client instance for database operations
 * @param assignment - The judge-question assignment to process
 * @param judge - The AI judge configuration (prompt, model)
 * @param question - The question and answer data to evaluate
 * @param openaiApiKey - OpenAI API key for LLM calls
 * @returns Evaluation result with verdict and success status
 */
export async function evaluateAssignment(
  supabase: SupabaseClient,
  assignment: Assignment,
  judge: JudgeData,
  question: QuestionData,
  openaiApiKey: string
): Promise<EvaluationResult> {
  try {
    // Call OpenAI API to get the evaluation
    // Pass question_type so the prompt can be tailored to the question type
    const result = await callOpenAI(
      openaiApiKey,
      judge.system_prompt,
      question.question_text,
      question.question_type,
      question.answer_json,
      judge.model
    );

    // Save successful evaluation to database
    await saveEvaluation(
      supabase,
      question.submission_id,
      assignment.question_id,
      assignment.judge_id,
      result.verdict,
      result.reasoning || null
    );

    // Return successful evaluation result
    return {
      questionId: assignment.question_id,
      judgeId: assignment.judge_id,
      verdict: result.verdict,
      success: true,
    };
  } catch (error) {
    // Log error for debugging
    console.error(
      `Error evaluating question ${assignment.question_id} with judge ${assignment.judge_id}:`,
      error
    );

    // Save inconclusive result on error so we have a record of the failure
    try {
      await saveEvaluation(
        supabase,
        question.submission_id,
        assignment.question_id,
        assignment.judge_id,
        'inconclusive',
        `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    } catch (saveError) {
      console.error('Failed to save error evaluation:', saveError);
    }

    return {
      questionId: assignment.question_id,
      judgeId: assignment.judge_id,
      verdict: 'inconclusive',
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
