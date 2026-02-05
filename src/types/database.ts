export type Verdict = 'pass' | 'fail' | 'inconclusive';

export interface Workspace {
  id: string;
  user_id: string;
  name: string;
  temporary: boolean;
  created_at: string;
}

export interface Submission {
  id: string;
  workspace_id: string;
  queue_id: string | null;
  created_at: string;
}

export interface Question {
  id: string;
  submission_id: string;
  question_text: string;
  question_type: string | null;
}

export interface Answer {
  question_id: string;
  answer_json: unknown;
}

export interface Judge {
  id: string;
  user_id: string;
  name: string;
  system_prompt: string;
  model: string;
  created_at: string;
}

export interface JudgeAssignment {
  judge_id: string;
  question_id: string;
}

export interface Evaluation {
  id: string;
  submission_id: string;
  question_id: string;
  judge_id: string;
  verdict: Verdict;
  reasoning: string | null;
  created_at: string;
}
