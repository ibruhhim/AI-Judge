/**
 * Judge Profile Component
 * 
 * Displays a judge's profile in a modal/overlay view.
 * Allows viewing, editing, and deleting the judge.
 */

import { useState } from 'react';
import { Judge } from '../../types/database';
import { getJudgeAvatarUrl } from '../../utils/judgeAvatar';
import JudgeForm from './JudgeForm';

interface JudgeProfileProps {
  judge: Judge;
  onUpdate: (name: string, prompt: string, model: string) => void;
  onDelete: (judgeId: string, judgeName: string) => void;
  onClose: () => void;
}

function JudgeProfile({ judge, onUpdate, onDelete, onClose }: JudgeProfileProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDelete = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    onDelete(judge.id, judge.name);
    onClose();
  };

  const handleUpdate = (name: string, prompt: string, model: string) => {
    onUpdate(name, prompt, model);
    setIsEditing(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-overlay-dark backdrop-blur-sm">
      <div className="glass rounded-3xl p-8 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full glass-dark hover:bg-glass-dark text-text-tertiary hover:text-text-primary transition-smooth z-50"
          title="Close"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {isEditing ? (
          <div>
            <h2 className="text-3xl font-bold mb-6 gradient-text">Edit Judge</h2>
            <JudgeForm
              judge={judge}
              onSubmit={handleUpdate}
              onCancel={() => setIsEditing(false)}
            />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Profile Header */}
            <div className="flex items-center space-x-6">
              <img
                src={getJudgeAvatarUrl(judge.id)}
                alt={judge.name}
                className="w-24 h-24 rounded-2xl object-cover border-4 border-white/20 flex-shrink-0"
              />
              <div className="flex-1">
                <h2 className="text-4xl font-bold mb-2 gradient-text">{judge.name}</h2>
                <div className="flex items-center space-x-3">
                  <span className="px-3 py-1 text-sm rounded-lg bg-bg-tertiary text-text-secondary border border-glass">
                    {judge.model}
                  </span>
                </div>
              </div>
            </div>

            {/* System Prompt */}
            <div>
              <h3 className="text-lg font-semibold text-text-secondary mb-3">System Prompt</h3>
              <div className="glass-dark rounded-xl p-4">
                <p className="text-text-primary whitespace-pre-wrap">{judge.system_prompt}</p>
              </div>
            </div>

            {/* Metadata */}
            <div className="flex items-center justify-between text-sm text-text-tertiary">
              <span>Created: {new Date(judge.created_at).toLocaleDateString()}</span>
            </div>

            {/* Actions */}
            <div className="flex space-x-3 pt-4 border-t border-white/10">
              <button
                onClick={() => setIsEditing(true)}
                className="flex-1 px-6 py-3 bg-button-bg hover:bg-button-bg-hover text-button-text rounded-xl font-semibold transition-smooth shadow-lg"
              >
                Edit Judge
              </button>
              <button
                onClick={handleDelete}
                className="px-6 py-3 glass-dark hover:bg-danger-bg text-danger hover:text-danger-hover rounded-xl font-semibold transition-smooth"
              >
                Delete
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-overlay-dark backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="glass rounded-3xl p-8 shadow-2xl max-w-md w-full">
            <h3 className="text-2xl font-bold mb-4 text-text-primary">Delete Judge?</h3>
            <p className="text-text-secondary mb-6">
              Are you sure you want to delete <span className="font-semibold">"{judge.name}"</span>? This will also remove all assignments to questions.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={confirmDelete}
                className="flex-1 px-6 py-3 bg-danger hover:bg-danger-hover text-button-text rounded-xl font-semibold transition-smooth"
              >
                Delete
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-6 py-3 glass-dark hover:bg-glass-dark text-text-primary rounded-xl font-semibold transition-smooth"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default JudgeProfile;
