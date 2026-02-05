/**
 * Results Filters Component
 * 
 * Filter controls for the evaluation results table.
 * Allows filtering by:
 * - Question text (search by question text)
 * - Verdict (pass/fail/inconclusive)
 * - Question type (multiple_choice/single_choice_with_reasoning/free_form)
 */

import { Verdict } from '../../types/database';

export type QuestionType = 'multiple_choice' | 'single_choice_with_reasoning' | 'free_form' | null;

export type SortOption = 'default' | 'alphabetical' | 'best_to_worst' | 'worst_to_best';

interface Filters {
  questionText: string;
  verdict: Verdict | '';
  questionType: QuestionType | '';
  sortBy: SortOption;
}

interface ResultsFiltersProps {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
}

function ResultsFilters({ filters, onFiltersChange }: ResultsFiltersProps) {
  return (
    <div className="glass rounded-3xl p-8 shadow-2xl">
      <h2 className="text-3xl font-bold mb-2 gradient-text">Filters</h2>
      <p className="text-text-tertiary mb-6">Refine your evaluation results</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div>
          <label className="block text-sm font-semibold text-text-secondary mb-3">
            Search Question
          </label>
          <input
            type="text"
            value={filters.questionText}
            onChange={(e) =>
              onFiltersChange({ ...filters, questionText: e.target.value })
            }
            placeholder="Search by question text..."
            className="w-full px-4 py-3 glass-dark rounded-xl text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-2 focus:ring-orange focus:border-transparent transition-smooth"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-text-secondary mb-3">
            Verdict
          </label>
          <select
            value={filters.verdict}
            onChange={(e) =>
              onFiltersChange({
                ...filters,
                verdict: e.target.value as Verdict | '',
              })
            }
            className="w-full px-4 py-3 glass-dark rounded-xl text-text-primary focus:outline-none focus:ring-2 focus:ring-orange focus:border-transparent transition-smooth"
          >
            <option value="" className="bg-bg-primary">All Verdicts</option>
            <option value="pass" className="bg-bg-primary">Pass</option>
            <option value="fail" className="bg-bg-primary">Fail</option>
            <option value="inconclusive" className="bg-bg-primary">Inconclusive</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold text-text-secondary mb-3">
            Question Type
          </label>
          <select
            value={filters.questionType}
            onChange={(e) =>
              onFiltersChange({
                ...filters,
                questionType: e.target.value as QuestionType | '',
              })
            }
            className="w-full px-4 py-3 glass-dark rounded-xl text-text-primary focus:outline-none focus:ring-2 focus:ring-orange focus:border-transparent transition-smooth"
          >
            <option value="" className="bg-bg-primary">All Types</option>
            <option value="multiple_choice" className="bg-bg-primary">Multiple Choice</option>
            <option value="single_choice_with_reasoning" className="bg-bg-primary">Single Choice with Reasoning</option>
            <option value="free_form" className="bg-bg-primary">Free Form</option>
          </select>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
        <div>
          <label className="block text-sm font-semibold text-text-secondary mb-3">
            Sort By
          </label>
          <select
            value={filters.sortBy}
            onChange={(e) =>
              onFiltersChange({
                ...filters,
                sortBy: e.target.value as SortOption,
              })
            }
            className="w-full md:w-64 px-4 py-3 glass-dark rounded-xl text-text-primary focus:outline-none focus:ring-2 focus:ring-orange focus:border-transparent transition-smooth"
          >
            <option value="default" className="bg-bg-primary">Default (Original Order)</option>
            <option value="alphabetical" className="bg-bg-primary">Alphabetical</option>
            <option value="best_to_worst" className="bg-bg-primary">Best to Worst (Accuracy)</option>
            <option value="worst_to_best" className="bg-bg-primary">Worst to Best (Accuracy)</option>
          </select>
        </div>
      </div>
    </div>
  );
}

export default ResultsFilters;
