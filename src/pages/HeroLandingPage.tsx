/**
 * Hero Landing Page Component
 * 
 * Main marketing landing page for Judge.ai
 * Showcases the AI judge platform with compelling hero section
 */

import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import AIJudgeCard from '../components/shared/AIJudgeCard';
import SectionHeader from '../components/shared/SectionHeader';
import Button from '../components/shared/Button';
import BesimpleLogo from '../components/shared/BesimpleLogo';
import PalmTreeLogo from '../components/shared/PalmTreeLogo';
import EvaluationExample from '../components/shared/EvaluationExample';
import AnimatedLineChart from '../components/shared/AnimatedLineChart';

function HeroLandingPage() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const evaluationSection = useScrollAnimation({ threshold: 0.2 });
  const judgesSection = useScrollAnimation({ threshold: 0.2 });
  const analyticsSection = useScrollAnimation({ threshold: 0.2 });
  const leftCards = useScrollAnimation({ threshold: 0.2 });
  const rightCards = useScrollAnimation({ threshold: 0.2 });

  return (
    <div className="min-h-screen flex flex-col relative overflow-x-hidden">
      
      <div className="relative z-10">
        {/* Hero Section */}
        <section className="h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 pb-32 relative" style={{ backgroundColor: 'rgba(255, 107, 53, 0.06)' }}>

        
        <div className="max-w-7xl mx-auto text-center relative z-20">
          {/* Main Heading */}
          <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold mb-4">
            <span className="gradient-text drop-shadow-glow-orange drop-shadow-glow-green">Judge.ai</span>
          </h1>
          
          {/* Challenge By */}
          <div className="mb-6 flex items-center justify-center space-x-2">
            <span className="text-sm md:text-base text-text-tertiary">challenge by</span>
            <BesimpleLogo size="sm" />
          </div>
          
          {/* Subheading */}
          <p className="text-xl md:text-2xl lg:text-3xl text-text-secondary mb-4 max-w-3xl mx-auto">
            Evaluate submissions with intelligent AI judges
          </p>
          <p className="text-lg md:text-xl text-text-tertiary mb-12 max-w-2xl mx-auto">
            Upload your data, configure custom AI judges, and get detailed evaluation results in minutes
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              onClick={() => navigate('/workflow/upload')}
              variant="primary"
              size="lg"
              className={`hover:scale-105 shadow-glow-orange ${
                theme === 'light' ? 'bg-white text-gray-900 hover:bg-gray-100' : ''
              }`}
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              }
            >
              Get Started
            </Button>
            <Button
              onClick={() => navigate('/workspaces')}
              variant="secondary"
              size="lg"
              className="hover:scale-105"
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
              }
            >
              My Workspaces
            </Button>
          </div>
        </div>
      </section>

      {/* Intelligent Evaluation Section */}
      <section ref={evaluationSection.ref} className={`pt-20 pb-48 px-4 sm:px-6 lg:px-8 bg-bg-secondary relative z-10 scroll-fade-in ${evaluationSection.isVisible ? 'visible' : ''}`}>
        <div className="max-w-7xl mx-auto">
          <SectionHeader
            gradientText="Intelligent"
            title="Evaluation"
            subtitle="Advanced AI judges that understand context and provide detailed, accurate evaluations"
          />
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <div ref={leftCards.ref} className={`space-y-6 scroll-slide-left ${leftCards.isVisible ? 'visible' : ''}`}>
              <div className="glass rounded-3xl p-8 shadow-glow-orange hover-scale transition-smooth">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-orange/20 flex items-center justify-center border-2 border-orange/30 shadow-lg">
                    <svg className="w-8 h-8 text-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-text-primary">Context-Aware Analysis</h3>
                </div>
                <p className="text-text-secondary leading-relaxed">
                  Our AI judges go beyond simple keyword matching. They understand the full context of each submission, 
                  analyzing relationships, intent, and quality to provide meaningful evaluations.
                </p>
              </div>
              
              <div className="glass rounded-3xl p-8 shadow-glow-orange hover-scale transition-smooth">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-orange/20 flex items-center justify-center border-2 border-orange/30 shadow-lg">
                    <svg className="w-8 h-8 text-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-text-primary">Detailed Reasoning</h3>
                </div>
                <p className="text-text-secondary leading-relaxed">
                  Every evaluation includes comprehensive reasoning, explaining what was assessed, 
                  what criteria were applied, and why a particular verdict was reached.
                </p>
              </div>
            </div>
            
            <div ref={rightCards.ref} className={`scroll-slide-right ${rightCards.isVisible ? 'visible' : ''}`}>
              <div className="glass rounded-3xl p-8 shadow-2xl mb-6">
                <h3 className="text-xl font-bold text-text-primary mb-6 text-center">Example Evaluation</h3>
                <EvaluationExample />
              </div>
              
              <div className="glass rounded-3xl p-6 shadow-2xl">
                <div className="space-y-3">
                  <div className="p-3 glass-dark rounded-xl">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-text-secondary font-medium text-sm">Accuracy Rate</span>
                      <span className="text-xl font-bold text-orange">98%</span>
                    </div>
                    <div className="w-full h-5 bg-gray-800/30 dark:bg-gray-200/20 rounded-full overflow-hidden border border-gray-700/30 dark:border-gray-600/30">
                      <div 
                        className="h-full bg-gradient-to-r from-green-200 via-green-600 to-green-900 rounded-full transition-all duration-1000 ease-out shadow-lg shadow-green-500/50"
                        style={{ width: '98%' }}
                      />
                    </div>
                  </div>
                  <div className="p-3 glass-dark rounded-xl">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <svg className="w-5 h-5 text-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-text-secondary font-medium text-sm">Response Time</span>
                      </div>
                      <span className="text-xl font-bold text-orange">2.3s</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 h-2 bg-gray-800/30 dark:bg-gray-200/20 rounded-full overflow-hidden border border-gray-700/30 dark:border-gray-600/30">
                        <div 
                          className="h-full bg-gradient-to-r from-green-200 via-green-600 to-green-900 rounded-full transition-all duration-1000 ease-out shadow-lg shadow-green-500/50"
                          style={{ width: '85%' }}
                        />
                      </div>
                      <span className="text-xs text-text-tertiary">Fast</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AI Judges Showcase Section */}
      <section ref={judgesSection.ref} className={`pt-20 pb-48 px-4 sm:px-6 lg:px-8 relative z-10 scroll-fade-in ${judgesSection.isVisible ? 'visible' : ''}`}>
        <div className="max-w-7xl mx-auto">
          <SectionHeader
            gradientText="AI Judges"
            subtitle="Customizable AI judges with specialized evaluation criteria"
          />
          
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-stagger">
                    <AIJudgeCard
              judgeId="qa-judge"
              name="Quality Assurance"
              model="GPT-4 Turbo"
              systemPrompt="You are a quality assurance expert evaluating submissions. Assess completeness, accuracy, and adherence to requirements. Provide clear pass/fail verdicts with detailed reasoning about what meets or fails to meet the criteria."
              avatarSet={1}
            />
            <AIJudgeCard
              judgeId="technical-judge"
              name="Technical Accuracy"
              model="GPT-5.1"
              systemPrompt="You are a technical expert focused on code quality, algorithm correctness, and best practices. Evaluate technical submissions for correctness, efficiency, and adherence to technical standards. Flag any errors or inefficiencies with specific recommendations."
              avatarSet={2}
            />
            <AIJudgeCard
              judgeId="creative-judge"
              name="Creative Evaluation"
              model="GPT-4o"
              systemPrompt="You are a creative evaluator assessing innovation, originality, and creative problem-solving. Evaluate submissions for unique approaches, creative thinking, and novel solutions. Appreciate out-of-the-box thinking and reward innovative perspectives."
              avatarSet={3}
            />
          </div>
        </div>
      </section>

      {/* Detailed Analytics Section */}
      <section ref={analyticsSection.ref} className={`pt-20 pb-48 px-4 sm:px-6 lg:px-8 bg-bg-secondary relative z-10 scroll-fade-in ${analyticsSection.isVisible ? 'visible' : ''}`}>
        <div className="max-w-7xl mx-auto">
          <SectionHeader
            gradientText="Detailed"
            title="Analytics"
            subtitle="Get comprehensive insights with pass rates, verdicts, and filterable results"
          />
          
          <div className="max-w-4xl mx-auto">
            <AnimatedLineChart />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="pt-20 pb-12 px-4 sm:px-6 lg:px-8 relative z-10 border-t border-glass">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <PalmTreeLogo size="md" />
                <h3 className="text-2xl font-bold gradient-text">Judge.ai</h3>
              </div>
              <p className="text-text-tertiary text-sm">
                Evaluate submissions with intelligent AI judges. Powered by advanced AI technology.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-text-primary mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li>
                  <button
                    onClick={() => navigate('/workflow/upload')}
                    className="text-text-tertiary hover:text-text-primary transition-smooth text-sm"
                  >
                    Get Started
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => navigate('/workspaces')}
                    className="text-text-tertiary hover:text-text-primary transition-smooth text-sm"
                  >
                    My Workspaces
                  </button>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-text-primary mb-4">Challenge By</h4>
              <div className="flex items-center">
                <BesimpleLogo size="sm" />
              </div>
            </div>
          </div>
          <div className="pt-8 border-t border-glass text-center">
            <div className="flex items-center justify-center space-x-2">
              <PalmTreeLogo size="sm" />
              <p className="text-text-tertiary text-sm">
                © {new Date().getFullYear()} Judge.ai. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
      </div>
    </div>
  );
}

export default HeroLandingPage;
