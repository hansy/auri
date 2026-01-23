import React, { useState } from 'react';
import { Language, CEFR, UserProfile } from '../types';
import { LANGUAGES, CEFR_LEVELS } from '../constants';
import { Mail, ArrowRight, PenTool, Mic2, BookCheck, Sparkles, Info } from 'lucide-react';

interface LandingProps {
  onStart: (lang?: Language, level?: CEFR) => void;
  user: UserProfile | null;
}

const Landing: React.FC<LandingProps> = ({ onStart, user }) => {
  const [selectedLanguage, setSelectedLanguage] = useState<Language>(Language.ENGLISH);
  const [selectedLevel, setSelectedLevel] = useState<CEFR>(CEFR.B1);
  const [email, setEmail] = useState('');
  const [showTooltip, setShowTooltip] = useState(false);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderCTABox = () => (
    <div id="cta-box" className="w-full max-w-xl mx-auto md:mx-0 bg-white border border-stone-200 rounded-[2.5rem] p-8 md:p-10 shadow-xl flex flex-col items-center text-center relative z-10">
      {!user ? (
        <>
          {/* Language Selection */}
          <div className="w-full space-y-4 mb-8">
            <label className="text-[10px] font-bold uppercase tracking-[0.25em] text-stone-400 block">Target Language</label>
            <div className="flex flex-wrap justify-center gap-2">
              {LANGUAGES.map(lang => (
                <button
                  key={lang}
                  onClick={() => setSelectedLanguage(lang)}
                  className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                    selectedLanguage === lang 
                      ? 'bg-stone-900 text-white' 
                      : 'bg-stone-50 text-stone-600 border border-stone-100 hover:border-stone-300'
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>
          </div>

          {/* Proficiency Selection */}
          <div className="w-full space-y-4 mb-10">
            <div className="flex items-center justify-center gap-2">
              <label className="text-[10px] font-bold uppercase tracking-[0.25em] text-stone-400">Proficiency Level</label>
              <div className="relative flex items-center">
                <button 
                  onMouseEnter={() => setShowTooltip(true)}
                  onMouseLeave={() => setShowTooltip(false)}
                  className="text-stone-300 hover:text-stone-500 transition-colors cursor-help"
                  aria-label="Level information"
                >
                  <Info className="w-3.5 h-3.5" />
                </button>
                {showTooltip && (
                  <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 w-64 p-4 bg-stone-900 text-white text-[11px] font-medium leading-relaxed rounded-2xl shadow-2xl z-[100] animate-in fade-in slide-in-from-bottom-2">
                    <p>Designed for learners with basic knowledge (A2+). Not optimized for absolute beginners starting from zero.</p>
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-stone-900" />
                  </div>
                )}
              </div>
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              {CEFR_LEVELS.map(lvl => (
                <button
                  key={lvl}
                  onClick={() => setSelectedLevel(lvl)}
                  className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                    selectedLevel === lvl 
                      ? 'bg-stone-900 text-white' 
                      : 'bg-stone-50 text-stone-600 border border-stone-100 hover:border-stone-300'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          {/* Email Input + Button Group */}
          <div className="w-full flex flex-col sm:flex-row gap-2">
            <input 
              type="email" 
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-grow px-6 py-4 bg-stone-50 border border-stone-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-stone-900/5 focus:border-stone-900 transition-all text-stone-800 placeholder:text-stone-300"
            />
            <button
              onClick={() => onStart(selectedLanguage, selectedLevel)}
              className="group shrink-0 px-8 py-4 bg-stone-900 text-white rounded-2xl font-semibold hover:bg-stone-800 transition-all flex items-center justify-center gap-3 shadow-md active:translate-y-0.5"
            >
              <span>Get Started</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </>
      ) : (
        <div className="w-full space-y-6">
          <div className="flex items-center justify-center gap-4 p-6 bg-stone-900 text-white rounded-[2rem]">
            <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center">
              <Sparkles className="w-6 h-6" />
            </div>
            <div className="text-left">
              <p className="text-xs uppercase tracking-widest opacity-60 font-bold">Welcome back</p>
              <p className="font-semibold">{user.targetLanguage} • {user.level} Session</p>
            </div>
          </div>
          
          <button
            onClick={() => onStart()}
            className="group relative w-full px-8 py-5 bg-stone-900 text-white rounded-2xl font-semibold text-lg hover:bg-stone-800 transition-all flex items-center justify-center gap-3 shadow-xl hover:shadow-2xl active:translate-y-0.5"
          >
            <Mail className="w-5 h-5 opacity-70" />
            <span>Open Today's Lesson</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-32 animate-in fade-in duration-1000">
      {/* Hero Section */}
      <div className="flex flex-col md:flex-row md:items-center gap-12 md:gap-24 min-h-[60vh] py-12">
        <div className="flex-1 flex flex-col justify-center space-y-8">
          <h2 className="text-5xl md:text-7xl font-semibold leading-[1.1] text-stone-900 serif tracking-tight">
            Achieve fluency <br />through comprehension
          </h2>
          <p className="text-xl text-stone-500 leading-relaxed max-w-xl">
            To learn a language you must first understand what you are hearing. 
            Daily Dictation helps train your ear through daily stories sent to your inbox.
          </p>
        </div>

        <div className="flex-1 flex justify-center md:justify-end">
          {renderCTABox()}
        </div>
      </div>

      {/* How it Works Section */}
      <div className="space-y-16 border-t border-stone-200 pt-24">
        <div className="text-center space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-[0.3em] text-stone-400">The Methodology</h3>
          <h4 className="text-3xl font-semibold text-stone-900 serif">How it works</h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="space-y-6 text-center md:text-left">
            <div className="w-14 h-14 bg-stone-100 rounded-2xl flex items-center justify-center text-stone-900 mx-auto md:mx-0">
              <PenTool className="w-6 h-6" />
            </div>
            <div className="space-y-3">
              <h5 className="font-semibold text-xl text-stone-800">1. Listen & Transcribe</h5>
              <p className="text-stone-500 text-sm leading-relaxed">
                Receive a daily story at your level. Listen and write it down by hand to bridge the gap between sound and meaning.
              </p>
            </div>
          </div>

          <div className="space-y-6 text-center md:text-left">
            <div className="w-14 h-14 bg-stone-100 rounded-2xl flex items-center justify-center text-stone-900 mx-auto md:mx-0">
              <Mic2 className="w-6 h-6" />
            </div>
            <div className="space-y-3">
              <h5 className="font-semibold text-xl text-stone-800">2. Oral Discussion</h5>
              <p className="text-stone-500 text-sm leading-relaxed">
                Engage in a spoken Q&A with our AI examiner to reinforce vocabulary and improve your active production.
              </p>
            </div>
          </div>

          <div className="space-y-6 text-center md:text-left">
            <div className="w-14 h-14 bg-stone-100 rounded-2xl flex items-center justify-center text-stone-900 mx-auto md:mx-0">
              <BookCheck className="w-6 h-6" />
            </div>
            <div className="space-y-3">
              <h5 className="font-semibold text-xl text-stone-800">3. Review & Adjust</h5>
              <p className="text-stone-500 text-sm leading-relaxed">
                Compare your notes to the transcript. Provide feedback to ensure tomorrow's lesson is perfectly tuned to your progress.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer CTA */}
      <div className="pt-24 pb-24 flex flex-col items-center gap-12 border-t border-stone-200">
        <div className="text-center space-y-4 max-w-md">
          <h3 className="text-3xl font-semibold text-stone-900 serif">Train your ear daily</h3>
          <p className="text-stone-500 leading-relaxed">
            Consistency is the only shortcut. Spend 15 minutes a day to achieve permanent fluency.
          </p>
        </div>
        
        <button
          onClick={scrollToTop}
          className="group relative px-12 py-5 bg-stone-900 text-white rounded-2xl font-semibold text-lg hover:bg-stone-800 transition-all flex items-center justify-center gap-3 shadow-xl hover:shadow-2xl active:translate-y-0.5"
        >
          <span>Start your first lesson</span>
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
};

export default Landing;