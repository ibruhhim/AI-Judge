/**
 * OpenAI API Integration Module
 * 
 * Handles all communication with the OpenAI API for running evaluations.
 * Enforces structured JSON output and validates responses before returning.
 * Builds type-specific prompts based on question type for accurate evaluation.
 */

import { OpenAIResponse, QuestionType } from './types.ts';

/**
 * Builds a type-specific evaluation prompt based on question type.
 * Different question types require different evaluation logic and data extraction.
 * 
 * @param questionType - The type of question (determines evaluation approach)
 * @param questionText - The question being evaluated
 * @param answerJson - The answer to evaluate (any JSON structure)
 * @returns A formatted prompt string with type-specific instructions
 */
function buildTypeSpecificPrompt(
  questionType: QuestionType,
  questionText: string,
  answerJson: unknown
): string {
  const answerStr = JSON.stringify(answerJson, null, 2);

  switch (questionType) {
    case 'multiple_choice':
      // Multiple Choice: Standard multiple-choice question without required explanation
      // Look for 'choice', 'label', or 'choices' in the JSON
      return `Question Type: Multiple Choice
Question: ${questionText}

Answer JSON:
${answerStr}

Evaluation Instructions:
- This is a standard multiple-choice question with a definitive ground truth.
- Extract the user's choice from the 'choice', 'label', or 'choices' field in the answer JSON.
- If 'choices' is an array, use the array values as the selected options.
- If 'choices' is a single value, treat it as the selected choice.
- Check if the choice(s) match the correct answer (ground truth).
- If the choice is incorrect, issue an immediate FAIL.
- If the choice is correct, issue a PASS.
- Respond with JSON: {"verdict": "pass" | "fail" | "inconclusive", "reasoning": "your explanation"}`;

    case 'single_choice_with_reasoning':
      // Single Choice with Reasoning: Fixed choice (like "yes/no") plus a text explanation
      // Check both choice AND reasoning, look for contradictions
      return `Question Type: Single Choice with Reasoning
Question: ${questionText}

Answer JSON:
${answerStr}

Evaluation Instructions:
- This question type expects a fixed choice (like "yes/no") plus a text explanation.
- Extract both the 'choice' (or 'label') AND 'reasoning' fields from the answer JSON.
- The choice must be correct AND the reasoning must support it.
- Look for contradictions: If the choice is correct but reasoning says "I don't know" or contradicts the choice, issue INCONCLUSIVE (human was guessing).
- If choice is wrong, issue FAIL.
- If choice is correct AND reasoning supports it, issue PASS.
- Respond with JSON: {"verdict": "pass" | "fail" | "inconclusive", "reasoning": "your explanation"}`;

    case 'free_form':
      // Free-Form: Subjective evaluation using system prompt/rubric
      // Look for 'text' or 'content' field
      return `Question Type: Free-Form (Open-Ended)
Question: ${questionText}

Answer JSON:
${answerStr}

Evaluation Instructions:
- Extract the text content from 'text' or 'content' field in the answer JSON.
- This is a subjective evaluation with no exact string match.
- Evaluate the quality, tone, and accuracy of the text.
- Use the system prompt (rubric) to determine if the human followed instructions.
- Act like a teacher: assess whether the answer demonstrates understanding.
- Respond with JSON: {"verdict": "pass" | "fail" | "inconclusive", "reasoning": "your explanation"}`;

    default:
      // Fallback for null/unknown types: generic evaluation
      return `Question: ${questionText}

Answer JSON:
${answerStr}

Evaluate this answer and respond with JSON in this exact format: {"verdict": "pass" | "fail" | "inconclusive", "reasoning": "your explanation here"}`;
  }
}

/**
 * Calls the OpenAI API to evaluate a question-answer pair.
 * 
 * The function:
 * 1. Builds a type-specific prompt based on question type
 * 2. Constructs a structured prompt with the question and answer
 * 3. Sends request to OpenAI with the judge's system prompt
 * 4. Enforces JSON output format for deterministic parsing
 * 5. Validates and parses the response
 * 6. Defaults to 'inconclusive' if parsing fails
 * 
 * @param apiKey - OpenAI API key (from environment variables)
 * @param systemPrompt - The judge's evaluation criteria/prompt
 * @param questionText - The question being evaluated
 * @param questionType - The type of question (determines evaluation logic)
 * @param answerJson - The answer to evaluate (any JSON structure)
 * @param model - OpenAI model to use (e.g., 'gpt-4', 'gpt-3.5-turbo')
 * @returns Parsed evaluation result with verdict and reasoning
 * @throws Error if API call fails or response is invalid
 */
export async function callOpenAI(
  apiKey: string,
  systemPrompt: string,
  questionText: string,
  questionType: QuestionType,
  answerJson: unknown,
  model: string
): Promise<OpenAIResponse> {
  // Build type-specific prompt that enforces JSON response format
  const userPrompt = buildTypeSpecificPrompt(questionType, questionText, answerJson);

  // Some models (like gpt-5 mini, gpt-5.1 mini) don't support temperature=0, only default (1)
  // Check if this is a model that doesn't support temperature=0
  const modelsWithoutTemperature = ['gpt-5-mini', 'gpt-5.1-mini', 'gpt-5 mini', 'gpt-5.1 mini'];
  const modelLower = model.toLowerCase();
  const supportsTemperature = !modelsWithoutTemperature.some(m => modelLower.includes(m.toLowerCase()));
  
  // Try with temperature: 0 first (if supported), and if it fails with unsupported_value, retry without temperature
  const makeRequest = async (includeTemperature: boolean): Promise<Response> => {
    const body: Record<string, unknown> = {
      model,
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: userPrompt,
        },
      ],
      response_format: { type: 'json_object' }, // Force JSON output format
    };

    // Only include temperature if the model supports it
    if (includeTemperature) {
      body.temperature = 0; // Deterministic output (no randomness)
    }

    // Add timeout to prevent hanging (2 minutes per request)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2 * 60 * 1000);

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error(`OpenAI API request timeout for model ${model}. The request took longer than 2 minutes.`);
      }
      throw error;
    }
  };

  // Try with temperature: 0 first (only if model supports it)
  let response = await makeRequest(supportsTemperature);

  // If we get an unsupported_value error for temperature, retry without it
  if (!response.ok) {
    const errorText = await response.text();
    let shouldRetry = false;
    
    try {
      const errorData = JSON.parse(errorText);
      // Check for temperature unsupported error by code and param, or by message
      if (
        (errorData.error?.code === 'unsupported_value' && errorData.error?.param === 'temperature') ||
        (errorData.error?.message && 
         errorData.error.message.includes("temperature") && 
         errorData.error.message.includes("does not support"))
      ) {
        shouldRetry = true;
      }
    } catch {
      // If parsing fails, check if error text mentions temperature
      if (errorText.includes('temperature') && errorText.includes('does not support')) {
        shouldRetry = true;
      }
    }
    
    if (shouldRetry) {
      // Retry without temperature parameter (will use model default)
      console.log(`Model ${model} doesn't support temperature=0, using default temperature`);
      response = await makeRequest(false);
    } else {
      // If it's not a temperature error, throw with the original error
      const errorMessage = errorText.includes('{') 
        ? JSON.parse(errorText).error?.message || errorText
        : errorText;
      throw new Error(`OpenAI API error: ${response.status} ${errorMessage}`);
    }
  }

  if (!response.ok) {
    const errorText = await response.text();
    let errorMessage = `OpenAI API error: ${response.status}`;
    
    try {
      const errorData = JSON.parse(errorText);
      if (errorData.error?.message) {
        errorMessage = `OpenAI API error: ${errorData.error.message}`;
        // Provide helpful message for model not found errors
        if (errorData.error.code === 'model_not_found' || errorData.error.message.includes('does not exist')) {
          errorMessage = `Model "${model}" is not available. Please update your judge to use a different model (e.g., gpt-3.5-turbo).`;
        }
      }
    } catch {
      errorMessage = `OpenAI API error: ${response.status} ${errorText}`;
    }
    
    throw new Error(errorMessage);
  }

  const data = await response.json();
  const content = data.choices[0]?.message?.content;

  if (!content) {
    throw new Error('No content in OpenAI response');
  }

  // Parse and validate JSON response
  let evaluationResult: OpenAIResponse;
  try {
    const parsed = JSON.parse(content);
    evaluationResult = {
      verdict: validateVerdict(parsed.verdict), // Ensure verdict is valid
      reasoning: parsed.reasoning || '', // Default to empty string if missing
    };
  } catch {
    // If JSON parsing fails, default to inconclusive
    // This handles cases where LLM returns invalid JSON despite format enforcement
    evaluationResult = {
      verdict: 'inconclusive',
      reasoning: 'Failed to parse LLM response as JSON',
    };
  }

  return evaluationResult;
}

/**
 * Validates that a verdict value is one of the allowed options.
 * Defaults to 'inconclusive' if verdict is invalid.
 * 
 * @param verdict - The verdict value to validate
 * @returns Valid verdict ('pass', 'fail', or 'inconclusive')
 */
function validateVerdict(verdict: unknown): 'pass' | 'fail' | 'inconclusive' {
  if (['pass', 'fail', 'inconclusive'].includes(verdict as string)) {
    return verdict as 'pass' | 'fail' | 'inconclusive';
  }
  return 'inconclusive';
}
