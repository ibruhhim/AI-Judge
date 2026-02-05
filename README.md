# AI Judge Challenge

A web application for evaluating submissions using AI judges powered by OpenAI.

## Project Structure

```
src/
├── components/          # React components organized by feature
│   ├── workflow/        # Main workflow steps (Upload, Judges, Assign, Results)
│   ├── workspace/       # Workspace management (Landing, Selection, View, Naming)
│   ├── judge/           # AI judge components (Form, Profile)
│   ├── results/         # Results display components (Table, Filters, Stats)
│   └── shared/          # Shared/reusable components (AssignmentMatrix, etc.)
├── services/            # Business logic and API calls
│   ├── evaluationQueryService.ts
│   ├── judgeManagementService.ts
│   ├── questionDataService.ts
│   ├── submissionImportService.ts
│   └── workspaceManagementService.ts
├── hooks/              # Custom React hooks
├── lib/                # Library configurations
│   └── supabase.ts
├── types/              # TypeScript type definitions
│   ├── database.ts
│   └── user.ts
├── utils/              # Utility functions
│   ├── judgeAvatar.ts
│   └── session.ts
└── App.tsx             # Main application component

supabase/
├── functions/          # Supabase Edge Functions
│   └── run-evaluations/
│       ├── index.ts
│       ├── database.ts
│       ├── evaluate.ts
│       ├── openai.ts
│       └── types.ts
└── schema.sql         # Database schema
```

## Features

### Workflow Steps
1. **Upload Data** - Import JSON submissions with questions and answers
2. **Configure Judges** - Create and manage AI judge configurations
3. **Assign Judges** - Assign judges to questions for evaluation
4. **View Results** - See evaluation results with filters and statistics

### Workspace Management
- Create temporary workspaces for quick evaluations
- Save workspaces with custom names
- Manage multiple workspaces
- Flexible workspace view for editing and re-running evaluations

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables in `.env`:
```
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
OPENAI_SECRET_KEY=your_openai_key
```

3. Run the development server:
```bash
npm run dev
```

## Component Organization

Components are organized by feature for easy navigation:

- **workflow/** - Main 4-step evaluation workflow
- **workspace/** - Workspace selection and management
- **judge/** - AI judge configuration and management
- **results/** - Results display and filtering
- **shared/** - Reusable components used across features


### Judgment & Trade-offs

- **Supabase for a relational, SQL-first backend**  
  - The core of this app is **relational**: workspaces → submissions → questions → answers, plus many‑to‑many relations (`judge_assignments`, `evaluations`). A Postgres-backed service like Supabase is a natural fit because we:
    - Run **joins and aggregations** for results (grouping by question, computing pass rates, filtering by judge/verdict).
    - Enforce **foreign keys and cascading deletes** so cleaning up a workspace reliably removes submissions, questions, answers, assignments, and evaluations.
  - Supabase also provides:
    - **Edge Functions** running close to the database for the `run-evaluations` LLM pipeline, keeping all evaluation logic server-side with minimal plumbing.
    - A **TypeScript client and typed schema** (`schema.sql` + `types/database.ts`) that align well with the React/TS frontend.
  - Compared to more document-oriented backends (e.g. Firebase/Firestore), this avoids manual relational constraints; SQL gives clearer queries and behavior for this domain. The trade-off is leaning into SQL and Supabase tooling, but that’s acceptable here for the clarity and correctness it buys.

- **Anonymous sessions instead of full auth**  
  - The app generates a per-browser `userId` in `utils/session.ts` and uses that to scope data (workspaces, judges). There’s no login UI or password flow.  
  - This keeps the UX frictionless for the challenge and avoids the complexity of OAuth/password reset flows that don’t add much to evaluating the LLM pipeline.  
  - Trade-off: users are effectively tied to a single browser; there is no cross-device identity or team sharing. That’s acceptable for a single-user demo app.

- **Single LLM provider (OpenAI)**  
  - Supporting only OpenAI keeps the prompt format, error handling, and pricing expectations consistent. The Edge function is simpler to reason about and test.  
  - Trade-off: no pluggable “model marketplace” abstraction. In a real product we’d likely introduce a provider interface, but here that would be extra codepaths for little interview value.

- **Stateless judges instead of agents**  
  - Judges are defined as `{ name, model, system_prompt }` and do not keep conversation history or state. Each evaluation is a pure function of (judge, question, answer).  
  - This matches the rubric (“evaluators, not agents”), simplifies schema, and makes the system easy to debug—rerunning an evaluation with the same inputs produces the same behavior (modulo LLM randomness).

- **Temporary workspaces and explicit Save**  
  - Workspaces start as `temporary = true` when you upload data; they only become “real” when you name/save them. Temporary workspaces are hidden from the Workspaces list and cleaned up on app load.  
  - This prevents the database from filling with half-finished runs while still letting us persist submissions/questions/answers during the workflow. The trade-off is slightly more logic around workspace cleanup, but the resulting UX (only seeing intentionally saved workspaces) is cleaner.

- **Judges shared across workspaces instead of per-workspace copies**  
  - Judges live at the user level and are referenced from multiple workspaces via `workspace_judge_selections` and `judge_assignments`. You configure a judge (prompt + model) once and can reuse it across many datasets.  
  - This keeps the schema smaller (no judge duplication per workspace), makes it easy to improve a judge and re-run it across workspaces, and matches the mental model of “my library of AI graders”.  
  - Trade-off: if you really wanted a slightly different version of a judge for one workspace, you’d create a new judge rather than tweak it in place. For this challenge, the simplicity and reusability of shared judges is more valuable than ultra-fine-grained per-workspace variants.

- **Sequential evaluation instead of concurrency**  
  - The Edge function processes assignments sequentially. This avoids hitting OpenAI rate limits, simplifies error handling, and keeps logs ordered and easy to follow.  
  - Trade-off: slower throughput for very large batches. For an interview-scale app, clarity and reliability are more important than maximum parallelism.

- **Fixed question types instead of fully dynamic schemas**  
  - Questions are tagged with a small, fixed set of types (`multiple_choice`, `single_choice_with_reasoning`, `free_form`), and the Edge function’s prompt builder branches on this union.  
  - This makes the evaluation logic predictable and testable: each type has clear expectations for how answers are shaped and how verdicts are decided.  
  - Trade-off: you can’t arbitrarily invent new question types at runtime without a code change. For this challenge, the clarity and safety of a closed set of types is more valuable than maximal flexibility.


## How This Project Meets the Evaluation Rubric

### Correctness

- **End-to-end flow**: Upload JSON → parse/validate → persist `submissions`/`questions`/`answers` via `submissionImportService` → configure judges → assign via `AssignStep`/`AssignmentMatrix` → run evaluations via the `run-evaluations` Edge function → fetch and display results in `ResultsStep`/`ResultsTable`.
- **Persistence**: All core entities live in Postgres (`schema.sql`), and the UI always refetches from Supabase on load, so page refreshes are safe.
- **Workspace lifecycle**: Workspaces are created as `temporary = true` for workflows; only the Save/Finish (naming) path flips `temporary` to `false`. Temporary workspaces are hidden from the Workspaces list and cleared on app load, ensuring users only see explicitly saved workspaces.

### Backend & LLM

- **Single execution path**: All LLM calls go through the `run-evaluations` Edge Function (`supabase/functions/run-evaluations`), which orchestrates fetching data, iterating assignments, calling OpenAI, and saving evaluations.
- **Server-side only**: The frontend never calls OpenAI directly or sees API keys; keys live in Edge function environment variables (`OPENAI_SECRET_KEY`).
- **Deterministic & safe**: One LLM call per `(judge, question)` assignment, with `response_format: { type: 'json_object' }` and temperature forced to `0` when supported. JSON parsing is wrapped in `try/catch`, and any parsing/API failures result in an `inconclusive` verdict instead of a crash.

### Code Quality

- **Feature-based structure**: Components and services are grouped by domain (`workflow`, `workspace`, `judge`, `results`, `shared`), which keeps responsibilities narrow and files discoverable.
- **Small, focused components**: `UploadStep`, `JudgesStep`, `AssignStep`, and `ResultsStep` each own one piece of the workflow; shared UI (e.g. `AssignmentMatrix`, `RunEvaluationsButton`) is reusable and isolated.
- **Side effects in services/hooks**: Data loading and mutations live in services (`*Service.ts`) and carefully-scoped `useEffect` calls; UI components stay mostly declarative.

### Types & Safety

- **Explicit domain types**: `types/database.ts` defines `Workspace`, `Submission`, `Question`, `Answer`, `Judge`, `Evaluation`, and `Verdict = 'pass' | 'fail' | 'inconclusive'`, mirrored in the Edge function’s `types.ts`.
- **Typed evaluation pipeline**: The Edge function uses `EvaluationRequest`, `JudgeData`, `QuestionData`, `EvaluationResult`, and `OpenAIResponse` to keep the evaluation flow type-safe end-to-end.
- **LLM output validation**: Parsed verdicts are validated against the union; malformed JSON or invalid verdicts are converted into a safe `inconclusive` result.

### UX & Polish

- **Workflow-first UX**: A 4-step workflow (Upload → Judges → Assign → Results) with clear progress and disabled “Next” buttons until prerequisites are met.
- **States handled**: Loading spinners for long operations, friendly empty states (no workspaces, no judges, no questions, no evaluations), and clear error messages instead of raw stack traces.
- **Readable results**: The results view groups by question, supports filtering by judge/verdict/question text, and highlights verdicts (PASS/FAIL/INCONCLUSIVE) with colored badges and summary stats.

### Judgment & Trade-offs

- **Supabase for a relational, SQL-first backend**  
  - The core of this app is **relational**: workspaces → submissions → questions → answers, plus many‑to‑many relations (`judge_assignments`, `evaluations`). A Postgres-backed service like Supabase is a natural fit because we:
    - Run **joins and aggregations** for results (grouping by question, computing pass rates, filtering by judge/verdict).
    - Enforce **foreign keys and cascading deletes** so cleaning up a workspace reliably removes submissions, questions, answers, assignments, and evaluations.
  - Supabase also provides:
    - **Edge Functions** running close to the database for the `run-evaluations` LLM pipeline, keeping all evaluation logic server-side with minimal plumbing.
    - A **TypeScript client and typed schema** (`schema.sql` + `types/database.ts`) that align well with the React/TS frontend.
  - Compared to more document-oriented backends (e.g. Firebase/Firestore), this avoids manual relational constraints; SQL gives clearer queries and behavior for this domain. The trade-off is leaning into SQL and Supabase tooling, but that’s acceptable here for the clarity and correctness it buys.

- **Anonymous sessions instead of full auth**  
  - The app generates a per-browser `userId` in `utils/session.ts` and uses that to scope data (workspaces, judges). There’s no login UI or password flow.  
  - This keeps the UX frictionless for the challenge and avoids the complexity of OAuth/password reset flows that don’t add much to evaluating the LLM pipeline.  
  - Trade-off: users are effectively tied to a single browser; there is no cross-device identity or team sharing. That’s acceptable for a single-user demo app.

- **Single LLM provider (OpenAI)**  
  - Supporting only OpenAI keeps the prompt format, error handling, and pricing expectations consistent. The Edge function is simpler to reason about and test.  
  - Trade-off: no pluggable “model marketplace” abstraction. In a real product we’d likely introduce a provider interface, but here that would be extra codepaths for little interview value.

- **Stateless judges instead of agents**  
  - Judges are defined as `{ name, model, system_prompt }` and do not keep conversation history or state. Each evaluation is a pure function of (judge, question, answer).  
  - This matches the rubric (“evaluators, not agents”), simplifies schema, and makes the system easy to debug—rerunning an evaluation with the same inputs produces the same behavior (modulo LLM randomness).

- **Temporary workspaces and explicit Save**  
  - Workspaces start as `temporary = true` when you upload data; they only become “real” when you name/save them. Temporary workspaces are hidden from the Workspaces list and cleaned up on app load.  
  - This prevents the database from filling with half-finished runs while still letting us persist submissions/questions/answers during the workflow. The trade-off is slightly more logic around workspace cleanup, but the resulting UX (only seeing intentionally saved workspaces) is cleaner.

- **Judges shared across workspaces instead of per-workspace copies**  
  - Judges live at the user level and are referenced from multiple workspaces via `workspace_judge_selections` and `judge_assignments`. You configure a judge (prompt + model) once and can reuse it across many datasets.  
  - This keeps the schema smaller (no judge duplication per workspace), makes it easy to improve a judge and re-run it across workspaces, and matches the mental model of “my library of AI graders”.  
  - Trade-off: if you really wanted a slightly different version of a judge for one workspace, you’d create a new judge rather than tweak it in place. For this challenge, the simplicity and reusability of shared judges is more valuable than ultra-fine-grained per-workspace variants.

- **Sequential evaluation instead of concurrency**  
  - The Edge function processes assignments sequentially. This avoids hitting OpenAI rate limits, simplifies error handling, and keeps logs ordered and easy to follow.  
  - Trade-off: slower throughput for very large batches. For an interview-scale app, clarity and reliability are more important than maximum parallelism.

- **Fixed question types instead of fully dynamic schemas**  
  - Questions are tagged with a small, fixed set of types (`multiple_choice`, `single_choice_with_reasoning`, `free_form`), and the Edge function’s prompt builder branches on this union.  
  - This makes the evaluation logic predictable and testable: each type has clear expectations for how answers are shaped and how verdicts are decided.  
  - Trade-off: you can’t arbitrarily invent new question types at runtime without a code change. For this challenge, the clarity and safety of a closed set of types is more valuable than maximal flexibility.
