/**
 * Assignment Matrix Component
 * 
 * Displays a matrix table showing all judges (columns) and questions (rows).
 * Allows users to assign/unassign judges to questions by clicking buttons.
 * Green buttons indicate assigned, gray buttons indicate unassigned.
 */

import { Judge, Question } from '../../types/database';
import { getJudgeAvatarUrl } from '../../utils/judgeAvatar';

interface AssignmentMatrixProps {
  judges: Judge[];
  questions: Question[];
  assignments: Set<string>; // Format: "judgeId-questionId"
  onToggle: (judgeId: string, questionId: string) => void;
  onDelete?: (questionId: string, questionText: string) => void;
}

function AssignmentMatrix({
  judges,
  questions,
  assignments,
  onToggle,
  onDelete,
}: AssignmentMatrixProps) {
  if (questions.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-text-tertiary">No questions available to assign</p>
      </div>
    );
  }

  if (judges.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-text-tertiary">No judges available to assign</p>
      </div>
    );
  }

  return (
    <div className="glass rounded-3xl p-8 shadow-2xl">
      <div className="overflow-x-auto rounded-2xl">
        <table className="min-w-full">
          <thead>
            <tr className="glass-dark border-b border-white/10">
              <th className="px py-4 text-left text-sm font-semibold text-text-secondary uppercase tracking-wider">
                Question
              </th>
              {judges.map((judge) => (
                <th
                  key={judge.id}
                  className="px-6 py-4 text-center text-sm font-semibold text-text-secondary uppercase tracking-wider"
                >
                  <div className="flex flex-col items-center space-y-3">
                    <img
                      src={getJudgeAvatarUrl(judge.id)}
                      alt={judge.name}
                      className="w-14 h-14 rounded-full object-cover border-2 border-glass"
                    />
                    <span className="text-xs">{judge.name}</span>
                  </div>
                </th>
              ))}
              {onDelete && (
                <th className="px-6 py-4 text-center text-sm font-semibold text-text-secondary uppercase tracking-wider w-24">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-glass">
            {questions.map((question, qIndex) => (
              <tr key={question.id} className={qIndex % 2 === 0 ? 'glass-dark' : 'bg-transparent hover:bg-glass-dark'}>
                <td className="px-6 py-4 text-sm text-text-primary max-w-md">
                  <div className="line-clamp-2">{question.question_text}</div>
                </td>
                {judges.map((judge) => {
                  const key = `${judge.id}-${question.id}`;
                  const isAssigned = assignments.has(key);
                  return (
                    <td key={judge.id} className="px-6 py-4 text-center">
                      <button
                        onClick={() => onToggle(judge.id, question.id)}
                        className={`px-4 py-2 rounded-xl text-sm font-semibold transition-smooth ${
                          isAssigned
                            ? 'bg-green hover:bg-green-dark text-button-text shadow-lg'
                            : 'glass-dark hover:bg-glass-dark text-text-tertiary hover:text-text-primary'
                        }`}
                      >
                        {isAssigned ? '✓ Assigned' : 'Assign'}
                      </button>
                    </td>
                  );
                })}
                {onDelete && (
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => onDelete(question.id, question.question_text)}
                      className="p-2 rounded-lg glass-dark hover:bg-danger-bg text-text-tertiary hover:text-danger transition-smooth"
                      title="Delete question"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AssignmentMatrix;
