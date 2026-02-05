/**
 * Judge Form Component
 * 
 * Form for creating or editing an AI judge configuration.
 * Collects: judge name, system prompt (evaluation criteria), and OpenAI model selection.
 * Can be used in both create and edit modes.
 */

import { useState, useEffect } from 'react';
import { Judge } from '../../types/database';

interface JudgeFormProps {
  onSubmit: (name: string, prompt: string, model: string) => void;
  onCancel: () => void;
  judge?: Judge | null; // Optional: if provided, form is in edit mode
}

function JudgeForm({ onSubmit, onCancel, judge }: JudgeFormProps) {
  const [name, setName] = useState('');
  const [prompt, setPrompt] = useState('');
  const [model, setModel] = useState('gpt-3.5-turbo');

  // Populate form when editing an existing judge
  useEffect(() => {
    if (judge) {
      setName(judge.name);
      setPrompt(judge.system_prompt);
      setModel(judge.model);
    } else {
      // Reset form for create mode
      setName('');
      setPrompt('');
      setModel('gpt-3.5-turbo');
    }
  }, [judge]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && prompt) {
      onSubmit(name, prompt, model);
      // Only reset if creating (not editing)
      if (!judge) {
        setName('');
        setPrompt('');
        setModel('gpt-3.5-turbo');
      }
    }
  };

  const isEditMode = !!judge;

  return (
    <form onSubmit={handleSubmit} className="glass-dark rounded-2xl p-6 space-y-5">
      <div>
        <label className="block text-sm font-semibold text-text-secondary mb-2">
          Judge Name
        </label>
        <input
          type="text"
          placeholder="e.g., Accuracy Judge, Quality Checker"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-3 glass-dark rounded-xl text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-2 focus:ring-orange focus:border-transparent transition-smooth"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-semibold text-text-secondary mb-2">
          System Prompt (Evaluation Criteria)
        </label>
        <textarea
          placeholder="Define how this judge should evaluate answers. Be specific about what constitutes a pass or fail."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="w-full px-4 py-3 glass-dark rounded-xl text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-2 focus:ring-orange focus:border-transparent transition-smooth resize-none"
          rows={6}
          required
        />
      </div>
      <div>
        <label className="block text-sm font-semibold text-text-secondary mb-2">
          AI Model
        </label>
        <select
          value={model}
          onChange={(e) => setModel(e.target.value)}
          className="w-full px-4 py-3 glass-dark rounded-xl text-text-primary focus:outline-none focus:ring-2 focus:ring-orange focus:border-transparent transition-smooth"
        >
          <optgroup label="GPT-3.5 Series" className="bg-bg-primary">
            <option value="gpt-3.5-turbo" className="bg-bg-primary">GPT-3.5 Turbo (Recommended)</option>
          </optgroup>
          <optgroup label="GPT-4 Series" className="bg-bg-primary">
            <option value="gpt-4-turbo" className="bg-bg-primary">GPT-4 Turbo</option>
            <option value="gpt-4-turbo-preview" className="bg-bg-primary">GPT-4 Turbo Preview</option>
            <option value="gpt-4o" className="bg-bg-primary">GPT-4o</option>
            <option value="gpt-4o-mini" className="bg-bg-primary">GPT-4o Mini</option>
          </optgroup>
          <optgroup label="GPT-5 Series" className="bg-bg-primary">
            <option value="gpt-5.1" className="bg-bg-primary">GPT-5.1</option>
            <option value="gpt-5-mini" className="bg-bg-primary">GPT-5 Mini</option>
            <option value="gpt-5-nano" className="bg-bg-primary">GPT-5 Nano</option>
          </optgroup>
        </select>
      </div>
      <div className="flex space-x-3 pt-2">
        <button
          type="submit"
          className="flex-1 px-6 py-3 bg-button-bg hover:bg-button-bg-hover text-button-text rounded-xl font-semibold transition-smooth shadow-lg"
        >
          {isEditMode ? 'Update Judge' : 'Create Judge'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-3 glass-dark hover:bg-glass-dark text-text-primary rounded-xl font-semibold transition-smooth"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

export default JudgeForm;
