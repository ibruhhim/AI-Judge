# Architecture & Code Organization

## Overview

The codebase is organized using a feature-based structure for maximum clarity and maintainability. Components, services, and utilities are grouped by their domain/feature.

## Directory Structure

```
src/
├── components/              # React components organized by feature
│   ├── workflow/           # Main 4-step evaluation workflow
│   │   ├── UploadStep.tsx      # Step 1: Upload submission data
│   │   ├── JudgesStep.tsx      # Step 2: Configure AI judges
│   │   ├── AssignStep.tsx      # Step 3: Assign judges to questions
│   │   └── ResultsStep.tsx     # Step 4: View evaluation results
│   │
│   ├── workspace/          # Workspace management
│   │   ├── LandingPage.tsx         # Main landing page with hero
│   │   ├── WorkspaceSelection.tsx  # Workspace selection interface
│   │   ├── WorkspaceView.tsx       # Flexible workspace dashboard
│   │   └── WorkspaceNamingDialog.tsx # Dialog for naming workspaces
│   │
│   ├── judge/              # AI judge management
│   │   ├── JudgeForm.tsx        # Form for creating/editing judges
│   │   └── JudgeProfile.tsx     # Modal view for judge details
│   │
│   ├── results/            # Results display
│   │   ├── ResultsTable.tsx     # Main results table (question-centric)
│   │   ├── ResultsFilters.tsx   # Filter controls
│   │   └── ResultsStats.tsx     # Statistics dashboard
│   │
│   └── shared/             # Shared/reusable components
│       ├── AssignmentMatrix.tsx      # Matrix for judge-question assignments
│       └── RunEvaluationsButton.tsx  # Button for triggering evaluations
│
├── services/               # Business logic and API calls
│   ├── evaluationQueryService.ts      # Query evaluation results
│   ├── judgeManagementService.ts      # Manage AI judges
│   ├── questionDataService.ts         # Manage questions
│   ├── submissionImportService.ts     # Import submission data
│   └── workspaceManagementService.ts  # Manage workspaces
│
├── hooks/                  # Custom React hooks
│   └── useSession.ts       # Session management hook
│
├── lib/                    # Library configurations
│   └── supabase.ts         # Supabase client setup
│
├── types/                  # TypeScript type definitions
│   ├── database.ts         # Database entity types
│   └── user.ts             # User-related types
│
├── utils/                  # Utility functions
│   ├── judgeAvatar.ts      # Generate judge avatar URLs
│   └── session.ts          # Session utility functions
│
└── App.tsx                 # Main application component

supabase/
├── functions/              # Supabase Edge Functions
│   └── run-evaluations/   # Evaluation execution function
│       ├── index.ts       # Main entry point
│       ├── database.ts    # Database operations
│       ├── evaluate.ts    # Evaluation orchestration
│       ├── openai.ts      # OpenAI API integration
│       └── types.ts       # Type definitions
└── schema.sql             # Database schema
```

## Import Patterns

### Component Imports

Use direct file imports:

```typescript
// ✅ Good - Direct imports
import UploadStep from './components/workflow/UploadStep';
import JudgesStep from './components/workflow/JudgesStep';
import WorkspaceView from './components/workspace/WorkspaceView';
import LandingPage from './components/workspace/LandingPage';
import JudgeForm from './components/judge/JudgeForm';
import ResultsTable from './components/results/ResultsTable';
import AssignmentMatrix from './components/shared/AssignmentMatrix';
```

### Service Imports

Services are imported directly:

```typescript
import { getAllUserJudges, createNewJudge } from './services/judgeManagementService';
import { getEvaluationsWithFilters } from './services/evaluationQueryService';
```

### Type Imports

Types are imported from the types directory:

```typescript
import { Judge, Question, Evaluation } from './types/database';
import { UserSession } from './types/user';
```

## Component Organization Principles

1. **Feature-Based Grouping**: Components are grouped by their primary feature/domain
2. **Co-location**: Related components are placed in the same directory
3. **Direct Imports**: Components are imported directly from their file paths
4. **Shared Components**: Reusable components used across features go in `shared/`

## Service Organization

Services are organized by domain:
- **evaluationQueryService**: Querying and filtering evaluation results
- **judgeManagementService**: CRUD operations for AI judges
- **questionDataService**: Question management and deduplication
- **submissionImportService**: JSON parsing and data import
- **workspaceManagementService**: Workspace CRUD operations

## Navigation Tips

- **Looking for workflow steps?** → `src/components/workflow/`
- **Looking for workspace UI?** → `src/components/workspace/`
- **Looking for judge management?** → `src/components/judge/`
- **Looking for results display?** → `src/components/results/`
- **Looking for reusable components?** → `src/components/shared/`
- **Looking for API calls?** → `src/services/`
- **Looking for types?** → `src/types/`
- **Looking for utilities?** → `src/utils/`
