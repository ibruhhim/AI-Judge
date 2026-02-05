/// <reference path="./deno.d.ts" />

/**
 * Supabase Edge Function: Run Evaluations
 * 
 * Main entry point for the run-evaluations Edge Function.
 * 
 * This function orchestrates the entire evaluation process:
 * 1. Validates request and environment variables
 * 2. Fetches all required data (submissions, questions, answers, judges, assignments)
 * 3. Processes each judge-question assignment sequentially
 * 4. Returns summary statistics
 * 
 * Endpoint: POST /functions/v1/run-evaluations
 * 
 * Request Body:
 * {
 *   "workspaceId": "uuid",
 *   "userId": "uuid"
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "processed": 10,
 *   "passed": 7,
 *   "failed": 2,
 *   "inconclusive": 1,
 *   "results": [...]
 * }
 */

// @ts-ignore - Deno types are available at runtime in Supabase Edge Functions
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
// @ts-ignore - ESM imports work in Deno runtime
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { EvaluationRequest, JudgeData, QuestionData, EvaluationResult, Assignment } from './types.ts';
import {
  getSubmissionsForWorkspace,
  getQuestionsForSubmissions,
  getAnswersForQuestions,
  getJudgeAssignments,
  getJudgesForUser,
  deleteOldEvaluations,
} from './database.ts';
import { evaluateAssignment } from './evaluate.ts';

// Environment variables (automatically set by Supabase)
// @ts-ignore - Deno.env is available at runtime
const OPENAI_SECRET_KEY = Deno.env.get('OPENAI_SECRET_KEY');
// @ts-ignore - Deno.env is available at runtime
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
// @ts-ignore - Deno.env is available at runtime
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    });
  }

  try {
    // Validate OpenAI API key
    if (!OPENAI_SECRET_KEY) {
      throw new Error('OPENAI_SECRET_KEY not configured in environment variables');
    }

    // Parse request body
    const { workspaceId, userId }: EvaluationRequest = await req.json();

    if (!workspaceId || !userId) {
      return errorResponse('Missing workspaceId or userId', 400);
    }

    // Create Supabase client with service role key for full database access
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Step 1: Fetch all submissions in the workspace
    console.log(`[run-evaluations] Starting evaluation for workspace: ${workspaceId}`);
    const submissionIds = await getSubmissionsForWorkspace(supabase, workspaceId);
    console.log(`[run-evaluations] Found ${submissionIds.length} submissions`);
    
    // Step 2: Fetch all questions for these submissions
    const questions = await getQuestionsForSubmissions(supabase, submissionIds);
    const questionIds = questions.map((q) => q.id);
    console.log(`[run-evaluations] Found ${questions.length} questions`);
    
    // Step 3: Fetch answers for all questions (as a Map for fast lookup)
    const answerMap = await getAnswersForQuestions(supabase, questionIds);
    console.log(`[run-evaluations] Found ${answerMap.size} answers`);
    
    // Step 4: Fetch all judge-question assignments
    let assignments: Assignment[];
    try {
      assignments = await getJudgeAssignments(supabase, questionIds);
    } catch (error) {
      // If no assignments found, return early with success (nothing to evaluate)
      if (error instanceof Error && error.message.includes('No judge assignments found')) {
        return successResponse([]);
      }
      throw error;
    }
    
    // Step 5: Get unique judge IDs and fetch judge configurations
    const judgeIds = [...new Set(assignments.map((a) => a.judge_id))];
    let judges: JudgeData[];
    try {
      judges = await getJudgesForUser(supabase, judgeIds, userId);
    } catch (error) {
      // If no judges found, return early with success (nothing to evaluate)
      if (error instanceof Error && error.message.includes('No judges found')) {
        return successResponse([]);
      }
      throw error;
    }

    // Step 6: Delete old evaluations that are no longer part of current assignments
    // This ensures that when re-running evaluations, removed judge assignments don't show old results
    console.log(`[run-evaluations] Cleaning up old evaluations`);
    await deleteOldEvaluations(supabase, questionIds, assignments);

    // Step 7: Create lookup maps for O(1) access during processing
    const judgeMap = new Map<string, JudgeData>();
    judges.forEach((j) => judgeMap.set(j.id, j));

    const questionMap = new Map<string, QuestionData>();
    questions.forEach((q) => {
      questionMap.set(q.id, {
        ...q,
        answer_json: answerMap.get(q.id), // Attach answer to question
      });
    });

    // Step 8: Process each assignment sequentially
    // Sequential processing ensures we don't overwhelm OpenAI API with concurrent requests
    console.log(`[run-evaluations] Processing ${assignments.length} assignments`);
    const results: EvaluationResult[] = [];
    let processedCount = 0;
    for (const assignment of assignments) {
      processedCount++;
      console.log(`[run-evaluations] Processing assignment ${processedCount}/${assignments.length}`);
      const judge = judgeMap.get(assignment.judge_id);
      const question = questionMap.get(assignment.question_id);

      // Skip if judge or question not found (shouldn't happen, but defensive)
      if (!judge || !question) {
        console.warn(`Skipping assignment: judge or question not found`);
        continue;
      }

      // Evaluate this assignment (calls OpenAI and saves to database)
      const result = await evaluateAssignment(
        supabase,
        assignment,
        judge,
        question,
        OPENAI_SECRET_KEY
      );

      results.push(result);
      console.log(`[run-evaluations] Completed assignment ${processedCount}/${assignments.length}: ${result.verdict}`);
    }

    // Step 9: Return summary response with statistics
    console.log(`[run-evaluations] Completed all evaluations. Total: ${results.length}`);
    return successResponse(results);
  } catch (error) {
    console.error('Edge function error:', error);
    return errorResponse(
      error instanceof Error ? error.message : 'Unknown error',
      500
    );
  }
});

/**
 * Creates a success response with evaluation statistics.
 * 
 * @param results - Array of evaluation results
 * @returns HTTP response with JSON body containing statistics
 */
function successResponse(results: EvaluationResult[]) {
  return new Response(
    JSON.stringify({
      success: true,
      processed: results.length, // Total evaluations processed
      passed: results.filter((r) => r.verdict === 'pass').length,
      failed: results.filter((r) => r.verdict === 'fail').length,
      inconclusive: results.filter((r) => r.verdict === 'inconclusive').length,
      results, // Detailed results for each evaluation
    }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    }
  );
}

/**
 * Creates an error response.
 * 
 * @param message - Error message to return
 * @param status - HTTP status code (400, 404, 500, etc.)
 * @returns HTTP error response with JSON body
 */
function errorResponse(message: string, status: number) {
  return new Response(
    JSON.stringify({ error: message }),
    {
      status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    }
  );
}
