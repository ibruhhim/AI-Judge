# Supabase Backend Files

## Files

- `schema.sql` - Database schema with all tables
- `run-evaluations.ts` - Edge Function for running AI judge evaluations

## Edge Function: run-evaluations

### Setup

1. **Set Environment Variables** in Supabase Dashboard:
   - Go to Project Settings → Edge Functions → Secrets
   - Add `OPENAI_SECRET_KEY` with your OpenAI API key
   - `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are automatically set

2. **Deploy the Function**:
   ```bash
   supabase functions deploy run-evaluations
   ```
   
   Or via Supabase Dashboard:
   - Go to Edge Functions
   - Create new function named `run-evaluations`
   - Copy the contents of `run-evaluations.ts`

### Usage

**Endpoint:** `POST /functions/v1/run-evaluations`

**Request Body:**
```json
{
  "workspaceId": "uuid",
  "userId": "uuid"
}
```

**Response:**
```json
{
  "success": true,
  "processed": 10,
  "passed": 7,
  "failed": 2,
  "inconclusive": 1,
  "results": [...]
}
```

### How It Works

1. Fetches all submissions for the workspace
2. Gets all questions and answers
3. Retrieves judge-question assignments
4. For each assignment:
   - Gets judge's prompt and model
   - Calls OpenAI API with structured prompt
   - Parses JSON response (verdict + reasoning)
   - Saves evaluation to database
5. Returns summary of processed evaluations

### Error Handling

- Invalid JSON responses default to `inconclusive` verdict
- API errors are caught and logged
- Failed evaluations are saved with error message in reasoning
- Uses `upsert` to handle re-runs (updates existing evaluations)
