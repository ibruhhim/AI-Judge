
-- ============================================================================
-- Database Schema for AI Judge Challenge
-- ============================================================================
-- 
-- This schema defines all tables needed for the AI Judge Challenge application.
-- Tables are designed to support:
-- - Multi-user workspaces
-- - Submissions with questions and answers
-- - AI judge configurations
-- - Judge-question assignments
-- - Evaluation results
--
-- All tables use UUID primary keys and include proper foreign key relationships
-- with CASCADE deletes to maintain referential integrity.
-- ============================================================================

-- Workspaces table
-- Each user can have multiple workspaces to organize their submissions
CREATE TABLE workspaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  temporary BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Submissions table
-- Represents a single uploaded submission containing questions and answers
CREATE TABLE submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  queue_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Questions table
-- Questions belong to submissions and can have associated answers
-- question_type determines the evaluation logic used by AI judges
CREATE TABLE questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_type TEXT CHECK (question_type IN ('multiple_choice', 'single_choice_with_reasoning', 'free_form') OR question_type IS NULL)
);

-- Answers table
-- Answers are stored as JSONB to support flexible answer structures
-- One answer per question (1:1 relationship)
CREATE TABLE answers (
  question_id UUID PRIMARY KEY REFERENCES questions(id) ON DELETE CASCADE,
  answer_json JSONB NOT NULL
);

-- Judges table
-- AI judge configurations (prompts, models) shared across all workspaces for a user
-- Judges are stateless evaluators, not autonomous agents
CREATE TABLE judges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  system_prompt TEXT NOT NULL,
  model TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Workspace judge selections table
-- Stores which judges are selected for each workspace
-- This allows users to choose which judges appear in the assign section
CREATE TABLE workspace_judge_selections (
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  judge_id UUID NOT NULL REFERENCES judges(id) ON DELETE CASCADE,
  PRIMARY KEY (workspace_id, judge_id)
);

-- Judge assignments table
-- Many-to-many relationship: judges can evaluate multiple questions,
-- and questions can be evaluated by multiple judges
CREATE TABLE judge_assignments (
  judge_id UUID NOT NULL REFERENCES judges(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  PRIMARY KEY (judge_id, question_id)
);

-- Evaluations table
-- Stores the results of AI judge evaluations
-- Each evaluation is the result of one judge evaluating one question
-- Verdict is constrained to: pass, fail, or inconclusive
CREATE TABLE evaluations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  judge_id UUID NOT NULL REFERENCES judges(id) ON DELETE CASCADE,
  verdict TEXT NOT NULL CHECK (verdict IN ('pass', 'fail', 'inconclusive')),
  reasoning TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (question_id, judge_id)
);

-- ============================================================================
-- Indexes for Query Performance
-- ============================================================================
-- 
-- Indexes are created on foreign keys and commonly filtered columns
-- to optimize query performance for the application's access patterns.
-- ============================================================================

CREATE INDEX idx_workspaces_user_id ON workspaces(user_id);
CREATE INDEX idx_questions_submission_id ON questions(submission_id);
CREATE INDEX idx_submissions_workspace_id ON submissions(workspace_id);
CREATE INDEX idx_judges_user_id ON judges(user_id);
CREATE INDEX idx_evaluations_submission_id ON evaluations(submission_id);
CREATE INDEX idx_evaluations_question_id ON evaluations(question_id);
CREATE INDEX idx_evaluations_judge_id ON evaluations(judge_id);
CREATE INDEX idx_evaluations_verdict ON evaluations(verdict);
CREATE INDEX idx_judge_assignments_question_id ON judge_assignments(question_id);
CREATE INDEX idx_workspace_judge_selections_workspace_id ON workspace_judge_selections(workspace_id);
CREATE INDEX idx_workspace_judge_selections_judge_id ON workspace_judge_selections(judge_id);