/**
 * Upload Step Component
 * 
 * Step 1 of the workflow: Upload Data
 * Allows users to:
 * - Create or select a workspace
 * - Upload a JSON file containing submissions with questions and answers
 * - Parse and import the data into the database
 */

import { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { supabase } from '../../lib/supabase';
import { createTemporaryWorkspace } from '../../services/workspaceManagementService';
import {
  createSubmissionWithQuestionsAndAnswers,
  parseSubmissionJsonFile,
  deleteAllSubmissionsForWorkspace,
} from '../../services/submissionImportService';

interface UploadStepProps {
  workspaceId?: string | null; // Optional: if provided, we're working with an existing workspace
  onComplete: (workspaceId: string) => void; // Simplified: no longer need to track if new
}

function UploadStep({ workspaceId: existingWorkspaceId, onComplete }: UploadStepProps) {
  const { theme } = useTheme();
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [inputMode, setInputMode] = useState<'file' | 'paste'>('file');
  const [pastedJson, setPastedJson] = useState('');

  /**
   * Processes JSON data (from file or paste) and imports it into the database
   */
  const processJsonData = async (jsonData: unknown) => {
    setIsUploading(true);
    setError(null);

    try {
      console.log('UploadStep: Starting to process JSON data:', jsonData);
      
      const parsedSubmissions = parseSubmissionJsonFile(jsonData);
      console.log('UploadStep: Parsed submissions:', parsedSubmissions);

      if (parsedSubmissions.length === 0) {
        throw new Error(
          'No submissions found in the JSON data. ' +
          'Expected format: Array of objects with "questions" (containing { rev, data: { id, questionText, questionType } }) and "answers" properties.'
        );
      }

      // Validate that submissions have questions
      for (let i = 0; i < parsedSubmissions.length; i++) {
        const submission = parsedSubmissions[i];
        if (!submission.questions || submission.questions.length === 0) {
          throw new Error(`Submission ${i + 1} has no questions. Each submission must have a "questions" array.`);
        }
      }

      // Determine workspace: use existing if provided, otherwise create temporary one
      let workspace;
      
      if (existingWorkspaceId) {
        // Working with existing workspace - verify it exists
        const { data, error: fetchError } = await supabase
          .from('workspaces')
          .select('id')
          .eq('id', existingWorkspaceId)
          .single();
        
        if (fetchError || !data) {
          throw new Error('Workspace not found');
        }
        
        workspace = { id: existingWorkspaceId };
        
        // Clear existing data in workspace before importing new data
        console.log('UploadStep: Clearing existing data in workspace...');
        await deleteAllSubmissionsForWorkspace(existingWorkspaceId);
        console.log('UploadStep: Existing data cleared, starting import...');
      } else {
        // Creating new temporary workspace
        console.log('UploadStep: Creating temporary workspace...');
        workspace = await createTemporaryWorkspace();
        console.log('UploadStep: Temporary workspace ID:', workspace.id);
      }

      // Create all submissions with their questions and answers
      let totalQuestions = 0;
      for (let i = 0; i < parsedSubmissions.length; i++) {
        const submissionData = parsedSubmissions[i];
        console.log(`UploadStep: Processing submission ${i + 1}/${parsedSubmissions.length} with ${submissionData.questions.length} questions`);
        
        try {
          await createSubmissionWithQuestionsAndAnswers(workspace.id, submissionData);
          totalQuestions += submissionData.questions.length;
        } catch (submissionError) {
          console.error(`UploadStep: Error processing submission ${i + 1}:`, submissionError);
          const errorMessage = submissionError instanceof Error 
            ? submissionError.message 
            : 'Unknown error';
          throw new Error(`Failed to import submission ${i + 1}: ${errorMessage}`);
        }
      }

      console.log(`UploadStep: Successfully imported ${parsedSubmissions.length} submission(s) with ${totalQuestions} question(s)`);
      setSuccessMessage(`Successfully imported ${parsedSubmissions.length} submission(s) with ${totalQuestions} question(s)!`);
      onComplete(workspace.id);
      
      // Auto-dismiss success message after 4 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 4000);
    } catch (err) {
      console.error('UploadStep: Error processing data:', err);
      const errorMessage = err instanceof Error 
        ? err.message 
        : String(err);
      
      // Provide more helpful error messages
      let displayMessage = errorMessage;
      if (errorMessage.includes('JSON')) {
        displayMessage = `Invalid JSON format: ${errorMessage}`;
      } else if (errorMessage.includes('questions')) {
        displayMessage = errorMessage;
      } else if (errorMessage.includes('Supabase') || errorMessage.includes('database')) {
        displayMessage = `Database error: ${errorMessage}. Please check your connection and try again.`;
      } else if (errorMessage.includes('workspace')) {
        displayMessage = `Workspace error: ${errorMessage}`;
      }
      
      setError(displayMessage);
    } finally {
      setIsUploading(false);
    }
  };

  /**
   * Handles file upload
   */
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError(null);
    
    try {
      // Read file as text
      let text = await file.text();
      
      // Check if file is empty
      if (!text.trim()) {
        throw new Error('The uploaded file is empty');
      }
      
      // Remove BOM (Byte Order Mark) if present (common in files saved from some editors)
      if (text.charCodeAt(0) === 0xFEFF) {
        text = text.slice(1);
      }
      
      // Trim whitespace
      text = text.trim();
      
      // Parse JSON
      let jsonData;
      try {
        jsonData = JSON.parse(text);
      } catch (parseError) {
        throw new Error(`Invalid JSON in file: ${parseError instanceof Error ? parseError.message : 'Unknown parsing error'}`);
      }
      
      // Process the JSON data
      await processJsonData(jsonData);
    } catch (err) {
      console.error('UploadStep: File upload error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to upload file';
      setError(`File upload failed: ${errorMessage}`);
      setIsUploading(false); // Ensure loading state is reset on error
    }
  };

  /**
   * Handles paste/submit of JSON data
   */
  const handlePasteSubmit = async () => {
    if (!pastedJson.trim()) {
      setError('Please paste JSON data');
      return;
    }

    try {
      const jsonData = JSON.parse(pastedJson);
      await processJsonData(jsonData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid JSON format');
    }
  };

  return (
    <div className="glass rounded-3xl p-8 shadow-2xl">
      <div className="mb-8">
        <h2 className="text-4xl font-bold mb-2 gradient-text">Upload Your Data</h2>
        <p className="text-text-tertiary">
          Import your submissions and start evaluating with AI judges
        </p>
      </div>
      
      <div className="space-y-6">
        {/* Input Mode Toggle */}
        <div>
          <label className="block text-sm font-semibold text-text-secondary mb-3">
            Input Method
          </label>
          <div className="flex space-x-2 glass-dark rounded-xl p-1">
            <button
              type="button"
              onClick={() => {
                setInputMode('file');
                setError(null);
              }}
              className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-smooth ${
                inputMode === 'file'
                  ? theme === 'dark' 
                    ? 'text-white shadow-lg'
                    : 'bg-button-bg text-button-text shadow-lg'
                  : 'text-text-tertiary hover:text-text-primary hover:bg-glass-dark'
              }`}
              style={inputMode === 'file' && theme === 'dark' ? { backgroundColor: '#262626' } : undefined}
            >
              Upload File
            </button>
            <button
              type="button"
              onClick={() => {
                setInputMode('paste');
                setError(null);
              }}
              className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-smooth ${
                inputMode === 'paste'
                  ? theme === 'dark'
                    ? 'text-white shadow-lg'
                    : 'bg-button-bg text-button-text shadow-lg'
                  : 'text-text-tertiary hover:text-text-primary hover:bg-glass-dark'
              }`}
              style={inputMode === 'paste' && theme === 'dark' ? { backgroundColor: '#262626' } : undefined}
            >
              Paste JSON
            </button>
          </div>
        </div>

        {/* File Upload Mode */}
        {inputMode === 'file' && (
          <div>
            <label className="block text-sm font-semibold text-text-secondary mb-3">
              Upload JSON File
            </label>
            <div className="relative">
              <input
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                disabled={isUploading}
                key={inputMode} // Reset input when switching modes
                className="block w-full text-sm text-text-secondary file:mr-4 file:py-3 file:px-6 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-button-bg file:text-button-text hover:file:bg-button-bg-hover file:cursor-pointer file:transition-smooth disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <p className="mt-3 text-sm text-text-tertiary">
                Upload a JSON file. Expected format: Array of submissions with nested question structure (rev, data.questionText, data.questionType)
              </p>
            </div>
          </div>
        )}

        {/* Paste JSON Mode */}
        {inputMode === 'paste' && (
          <div>
            <label className="block text-sm font-semibold text-text-secondary mb-3">
              Paste JSON Data
            </label>
            <textarea
              value={pastedJson}
              onChange={(e) => {
                setPastedJson(e.target.value);
                setError(null);
              }}
              disabled={isUploading}
              placeholder='Paste your JSON data here. Expected format:&#10;[&#10;  {&#10;    "id": "sub_001",&#10;    "questions": [&#10;      { "rev": 1, "data": { "id": "q1", "questionText": "...", "questionType": "..." } }&#10;    ],&#10;    "answers": { "q1": {...} }&#10;  }&#10;]'
              className="w-full h-64 px-4 py-3 glass-dark rounded-xl text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-2 focus:ring-orange focus:border-transparent transition-smooth font-mono text-sm resize-none disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <div className="mt-3 flex items-center justify-between">
              <p className="text-sm text-text-tertiary">
                Paste JSON data directly into the text area above
              </p>
              <button
                onClick={handlePasteSubmit}
                disabled={isUploading || !pastedJson.trim()}
                className="px-6 py-2 bg-button-bg hover:bg-button-bg-hover text-button-text rounded-xl font-semibold transition-smooth shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-button-bg"
                style={theme === 'dark' ? {
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5), 0 0 15px rgba(255, 107, 53, 0.4), 0 0 30px rgba(255, 107, 53, 0.2)',
                } : {}}
              >
                {isUploading ? 'Processing...' : 'Import Data'}
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="p-4 bg-danger-bg border border-danger rounded-xl text-danger backdrop-blur-sm">
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span>{error}</span>
            </div>
          </div>
        )}

        {successMessage && (
          <div className="p-4 bg-green-900/30 border border-green-700/50 rounded-xl text-green-300 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>{successMessage}</span>
              </div>
              <button
                onClick={() => setSuccessMessage(null)}
                className="ml-4 text-green-300 hover:text-green-200 transition-smooth"
                aria-label="Dismiss"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {isUploading && (
          <div className="flex items-center justify-center space-x-3 p-6 glass-dark rounded-xl">
            <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
            <span className="text-text-secondary font-medium">Uploading and processing your data...</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default UploadStep;
