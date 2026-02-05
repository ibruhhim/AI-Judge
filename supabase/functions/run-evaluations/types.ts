/**
 * Type Definitions for Run Evaluations Edge Function
 * 
 * Contains all TypeScript interfaces used throughout the evaluation process.
 * These types ensure type safety and clear contracts between modules.
 */

/**
 * Valid question types that determine evaluation logic
 * - multiple_choice: Standard multiple-choice question without required explanation, looks for 'choice' or 'label' in answer
 * - single_choice_with_reasoning: Fixed choice (like "yes/no") plus a text explanation, checks both choice AND reasoning for contradictions
 * - free_form: Standard text box where the human writes a custom response, subjective evaluation using system prompt/rubric
 */
export type QuestionType = 'multiple_choice' | 'single_choice_with_reasoning' | 'free_form' | null;

/**
 * Request payload for the run-evaluations Edge Function
 */
export interface EvaluationRequest {
  workspaceId: string; // The workspace to evaluate submissions from
  userId: string; // The user who owns the judges and workspace
}

/**
 * AI Judge configuration data
 * Represents a judge's prompt and model settings
 */
export interface JudgeData {
  id: string;
  name: string; // Display name for the judge
  system_prompt: string; // The prompt that defines evaluation criteria
  model: string; // OpenAI model to use (e.g., 'gpt-4', 'gpt-3.5-turbo')
}

/**
 * Question data with associated answer
 * Used during evaluation to provide context to the LLM
 * question_type determines how the AI judge evaluates the answer
 */
export interface QuestionData {
  id: string;
  question_text: string; // The question being evaluated
  question_type: QuestionType; // The type of question (determines evaluation logic)
  answer_json: unknown; // The answer to evaluate (can be any JSON structure)
  submission_id: string; // Parent submission ID for database relationships
}

/**
 * Judge-question assignment relationship
 * Represents which judge should evaluate which question
 */
export interface Assignment {
  judge_id: string;
  question_id: string;
}

/**
 * Result of a single evaluation
 * Returned after processing one judge-question pair
 */
export interface EvaluationResult {
  questionId: string;
  judgeId: string;
  verdict: 'pass' | 'fail' | 'inconclusive'; // The evaluation verdict
  success: boolean; // Whether the evaluation completed successfully
  error?: string; // Error message if evaluation failed
}

/**
 * Structured response from OpenAI API
 * Parsed from the LLM's JSON response
 */
export interface OpenAIResponse {
  verdict: 'pass' | 'fail' | 'inconclusive';
  reasoning: string; // Explanation for the verdict
}
