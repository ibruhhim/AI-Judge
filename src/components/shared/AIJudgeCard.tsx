/**
 * AI Judge Card Component
 * 
 * Reusable card component for displaying AI judge information
 */

import { getJudgeAvatarUrl } from '../../utils/judgeAvatar';

interface AIJudgeCardProps {
  judgeId: string;
  name: string;
  model: string;
  systemPrompt: string;
  avatarSet?: number;
}

function AIJudgeCard({ judgeId, name, model, systemPrompt, avatarSet = 1 }: AIJudgeCardProps) {
  // Alternate between orange and green glow
  const isOrange = avatarSet % 2 === 1;
  const glowClass = isOrange ? 'shadow-glow-orange' : 'shadow-glow-green';
  const borderGradient = isOrange 
    ? 'border-orange/30' 
    : 'border-green/30';
  
  return (
    <div className={`relative glass rounded-3xl p-6 hover-scale hover-lift transition-smooth ${glowClass} animate-slide-in-up overflow-hidden group max-w-sm mx-auto`}>
      {/* Gradient border effect */}
      <div className={`absolute inset-0 rounded-3xl border-2 ${borderGradient} opacity-0 group-hover:opacity-100 transition-smooth pointer-events-none`}></div>
      
      {/* Decorative gradient overlay */}
      {isOrange ? (
        <div className="absolute top-0 right-0 w-32 h-32 bg-orange/10 rounded-full blur-3xl opacity-50 group-hover:opacity-70 transition-smooth"></div>
      ) : (
        <div className="absolute top-0 right-0 w-32 h-32 bg-green/10 rounded-full blur-3xl opacity-50 group-hover:opacity-70 transition-smooth"></div>
      )}
      
      <div className="relative z-10">
        <div className="flex items-center space-x-5 mb-6">
          <div className="relative">
            {isOrange ? (
              <div className="absolute inset-0 bg-orange/20 rounded-full blur-xl group-hover:blur-2xl transition-smooth"></div>
            ) : (
              <div className="absolute inset-0 bg-green/20 rounded-full blur-xl group-hover:blur-2xl transition-smooth"></div>
            )}
            <img
              src={getJudgeAvatarUrl(judgeId, avatarSet)}
              alt={name}
              className="relative w-20 h-20 rounded-full object-cover border-2 border-glass flex-shrink-0 shadow-lg group-hover:scale-110 transition-smooth"
            />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-2xl font-bold text-text-primary mb-2 group-hover:text-orange transition-smooth">{name}</h3>
            <div className="flex items-center space-x-2">
              {isOrange ? (
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-orange/20 text-orange border border-orange/30">
                  {model}
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green/20 text-green border border-green/30">
                  {model}
                </span>
              )}
            </div>
          </div>
        </div>
        
        <div className="space-y-3">
          <div className="h-px bg-gradient-to-r from-transparent via-glass to-transparent"></div>
          <p className="text-sm text-text-secondary leading-relaxed font-medium">
            {systemPrompt}
          </p>
        </div>
      </div>
    </div>
  );
}

export default AIJudgeCard;
