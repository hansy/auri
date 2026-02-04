import { useState, useEffect } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { UserProfile, Language, CEFR, LessonStep, LessonContent, ReflectionFeedback } from '@dictation/shared/types';
import { generateDailyLesson } from '../services/gemini';
import { DOMAINS } from '@dictation/shared/constants';
import Landing from '../components/Landing';
import DictationStep from '../components/DictationStep';
import OralStep from '../components/OralStep';
import ReviewStep from '../components/ReviewStep';
import ReflectionStep from '../components/ReflectionStep';
import CompletionStep from '../components/CompletionStep';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Loader2 } from 'lucide-react';

export const Route = createFileRoute('/')({
  component: App,
})

const STORAGE_KEY = 'daily_dictation_user_v2';

function App() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [currentStep, setCurrentStep] = useState<LessonStep>(LessonStep.LANDING);
  const [lesson, setLesson] = useState<LessonContent | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem(STORAGE_KEY);
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const saveUser = (updatedUser: UserProfile) => {
    setUser(updatedUser);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUser));
  };

  const handleStartLesson = async (selectedLanguage?: Language, selectedLevel?: CEFR) => {
    setIsLoading(true);
    try {
      const language = selectedLanguage || user?.targetLanguage || Language.ENGLISH;
      const level = selectedLevel || user?.level || CEFR.B1;
      const domainIndex = user?.domainIndex || 0;
      const domain = DOMAINS[domainIndex % DOMAINS.length];

      const newLesson = await generateDailyLesson(language, level, domain);
      setLesson(newLesson);

      if (!user) {
        saveUser({
          targetLanguage: language,
          level: level,
          streak: 0,
          domainIndex: 1 // Next domain
        });
      }

      setCurrentStep(LessonStep.DICTATION);
    } catch (error) {
      console.error("Failed to start lesson", error);
      alert("Something went wrong preparing your lesson. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const nextStep = () => {
    const steps = [
      LessonStep.LANDING,
      LessonStep.DICTATION,
      LessonStep.ORAL_QA,
      LessonStep.REVIEW,
      LessonStep.REFLECTION,
      LessonStep.COMPLETION
    ];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1]);
    }
  };

  const handleReflectionComplete = (_feedback: ReflectionFeedback) => {
    if (user) {
      const updatedUser = { ...user };
      const today = new Date().toISOString().split('T')[0];

      if (user.lastCompletedDate !== today) {
        updatedUser.streak += 1;
        updatedUser.lastCompletedDate = today;
        updatedUser.domainIndex += 1; // Increment domain for tomorrow
      }
      saveUser(updatedUser);
    }
    nextStep();
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center bg-stone-50">
        <Loader2 className="w-12 h-12 mb-4 animate-spin text-stone-400" />
        <h2 className="text-2xl font-light serif text-stone-600">Curating your lesson...</h2>
        <p className="mt-2 text-stone-400">Strictly following CEFR {user?.level || 'B1'} standards.</p>
      </div>
    );
  }

  return (
    <main className="max-w-6xl mx-auto min-h-screen px-6 py-12 md:py-24 flex flex-col">
      <Header user={user} />

      <div className="flex-grow">
        {currentStep === LessonStep.LANDING && (
          <Landing onStart={handleStartLesson} user={user} />
        )}

        {currentStep === LessonStep.DICTATION && lesson && (
          <DictationStep lesson={lesson} onComplete={nextStep} />
        )}

        {currentStep === LessonStep.ORAL_QA && lesson && (
          <OralStep lesson={lesson} onComplete={nextStep} />
        )}

        {currentStep === LessonStep.REVIEW && lesson && (
          <ReviewStep lesson={lesson} onComplete={nextStep} />
        )}

        {currentStep === LessonStep.REFLECTION && (
          <ReflectionStep onComplete={handleReflectionComplete} />
        )}

        {currentStep === LessonStep.COMPLETION && (
          <CompletionStep onRestart={() => setCurrentStep(LessonStep.LANDING)} />
        )}
      </div>

      <Footer />
    </main>
  );
}
