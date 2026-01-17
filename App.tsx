
import React, { useState, useMemo } from 'react';
import { INITIAL_WORDS } from './constants';
import { AppStep, Activity, Category, Direction, RussianWord } from './types';
import Flashcard from './components/Flashcard';
import Quiz from './components/Quiz';
import { getWordExplanation } from './services/geminiService';

const App: React.FC = () => {
  const [step, setStep] = useState<AppStep>('select-activity');
  const [activity, setActivity] = useState<Activity>('flashcards');
  const [category, setCategory] = useState<Category>('verbs');
  const [rangeIndex, setRangeIndex] = useState(0); 
  
  const [direction, setDirection] = useState<Direction>('RU_FR');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [quizScore, setQuizScore] = useState<number | null>(null);
  const [aiExplanation, setAiExplanation] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Filtrage et sélection des mots
  const currentSelection = useMemo(() => {
    let base = [...INITIAL_WORDS];
    if (category === 'verbs') {
      base = base.filter(w => w.category === 'verbs');
    } else if (category === 'nouns') {
      base = base.filter(w => w.category === 'nouns');
    } else if (category === 'both') {
      // Pour le mode "Les deux", on peut soit mélanger soit prendre par blocs
      // Ici on garde l'ordre original qui alterne déjà potentiellement ou on laisse tel quel
    }
    
    const start = rangeIndex * 10;
    const end = start + 10;
    return base.slice(start, end);
  }, [category, rangeIndex]);

  const currentWord = currentSelection[currentIndex];

  const resetAll = () => {
    setStep('select-activity');
    setQuizScore(null);
    setCurrentIndex(0);
    setAiExplanation(null);
  };

  const handleNextWord = () => {
    setCurrentIndex((prev) => (prev + 1) % currentSelection.length);
    setAiExplanation(null);
  };

  const handlePrevWord = () => {
    setCurrentIndex((prev) => (prev - 1 + currentSelection.length) % currentSelection.length);
    setAiExplanation(null);
  };

  const askGemini = async () => {
    if (!currentWord) return;
    setIsAiLoading(true);
    const expl = await getWordExplanation(currentWord.russian, currentWord.category);
    setAiExplanation(expl);
    setIsAiLoading(false);
  };

  const toggleDirection = () => {
    setDirection(prev => prev === 'RU_FR' ? 'FR_RU' : 'RU_FR');
  };

  // --- ECRAN 1: ACTIVITE ---
  if (step === 'select-activity') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col p-6 items-center justify-center">
        <div className="max-w-md w-full text-center mb-12">
          <div className="inline-block p-4 bg-blue-600 rounded-3xl mb-6 shadow-xl shadow-blue-100">
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h1 className="text-4xl font-black text-slate-800 tracking-tight mb-2">Apprendre le Russe</h1>
          <p className="text-slate-500 font-medium italic">Comment souhaitez-vous apprendre ?</p>
        </div>
        <div className="w-full max-w-sm space-y-4">
          <button 
            onClick={() => { setActivity('flashcards'); setStep('select-category'); }}
            className="w-full py-8 bg-white border-2 border-slate-100 hover:border-blue-500 hover:shadow-xl rounded-3xl text-2xl font-bold text-slate-700 transition-all flex items-center justify-center gap-4 group"
          >
            <span className="text-4xl group-hover:scale-110 transition-transform">🃏</span> 
            <span>Flashcards</span>
          </button>
          <button 
            onClick={() => { setActivity('quiz'); setStep('select-category'); }}
            className="w-full py-8 bg-white border-2 border-slate-100 hover:border-blue-500 hover:shadow-xl rounded-3xl text-2xl font-bold text-slate-700 transition-all flex items-center justify-center gap-4 group"
          >
            <span className="text-4xl group-hover:scale-110 transition-transform">🧠</span> 
            <span>Quiz</span>
          </button>
        </div>
      </div>
    );
  }

  // --- ECRAN 2: CATEGORIE ---
  if (step === 'select-category') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col p-6 items-center justify-center">
        <button onClick={() => setStep('select-activity')} className="absolute top-6 left-6 text-slate-400 hover:text-slate-600 flex items-center gap-2 font-bold transition-colors">
          ← Retour
        </button>
        <h2 className="text-2xl font-extrabold text-slate-800 mb-8">Choisissez une catégorie</h2>
        <div className="w-full max-w-sm space-y-3">
          <button onClick={() => { setCategory('verbs'); setStep('select-range'); }} className="w-full p-6 bg-white rounded-2xl border-2 border-slate-100 hover:border-blue-500 font-bold text-lg text-slate-700 shadow-sm transition-all">Les Verbes</button>
          <button onClick={() => { setCategory('nouns'); setStep('select-range'); }} className="w-full p-6 bg-white rounded-2xl border-2 border-slate-100 hover:border-blue-500 font-bold text-lg text-slate-700 shadow-sm transition-all">Les Noms</button>
          <button onClick={() => { setCategory('both'); setStep('select-range'); }} className="w-full p-6 bg-white rounded-2xl border-2 border-slate-100 hover:border-blue-500 font-bold text-lg text-slate-700 shadow-sm transition-all">Les Deux (Mixte)</button>
        </div>
      </div>
    );
  }

  // --- ECRAN 3: RANGE ---
  if (step === 'select-range') {
    const ranges = ["1 - 10", "11 - 20", "21 - 30", "31 - 40", "41 - 50"];
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col p-6 items-center justify-center">
        <button onClick={() => setStep('select-category')} className="absolute top-6 left-6 text-slate-400 hover:text-slate-600 flex items-center gap-2 font-bold transition-colors">
          ← Retour
        </button>
        <h2 className="text-2xl font-extrabold text-slate-800 mb-8">Quel groupe de mots ?</h2>
        <div className="w-full max-w-sm space-y-3 max-h-[60vh] overflow-y-auto px-1">
          {ranges.map((label, idx) => (
            <button
              key={idx}
              onClick={() => { setRangeIndex(idx); setStep('game'); }}
              className="w-full p-5 bg-white rounded-2xl border-2 border-slate-100 hover:border-blue-500 font-bold text-slate-700 shadow-sm transition-all flex justify-between items-center"
            >
              <span>Mots {label}</span>
              <span className="text-blue-500 text-xl font-black">→</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // --- ECRAN FINAL: JEU ---
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col p-6 max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-4 bg-white/50 p-2 rounded-2xl backdrop-blur-sm">
        <button 
          onClick={resetAll}
          className="p-3 bg-white rounded-xl shadow-sm border border-slate-100 text-slate-400 hover:text-blue-600 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
        <div className="flex flex-col items-center">
            <span className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em]">
              {category === 'both' ? 'Mix' : category === 'verbs' ? 'Verbes' : 'Noms'} • {rangeIndex*10+1}-{rangeIndex*10+10}
            </span>
            <span className="font-bold text-slate-800 text-sm">{activity === 'flashcards' ? 'Flashcards' : 'Quiz'}</span>
        </div>
        <button 
          onClick={toggleDirection}
          className="p-2 px-3 bg-blue-600 text-white rounded-xl font-bold text-xs shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all active:scale-95"
        >
          {direction === 'RU_FR' ? 'RU → FR' : 'FR → RU'}
        </button>
      </div>

      {activity === 'flashcards' ? (
        <div className="flex-1 flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
          <Flashcard word={currentWord} direction={direction} />
          
          <div className="flex gap-4 mb-6">
            <button 
              onClick={handlePrevWord}
              className="flex-1 py-4 bg-white border border-slate-200 rounded-2xl text-slate-700 font-bold hover:bg-slate-50 transition-colors"
            >
              Précédent
            </button>
            <button 
              onClick={handleNextWord}
              className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-colors"
            >
              Suivant
            </button>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-blue-50 shadow-sm mt-auto mb-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <span className="text-blue-500">✨</span> Assistant IA
              </h3>
              {!aiExplanation && !isAiLoading && (
                <button 
                  onClick={askGemini}
                  className="text-[10px] font-black text-blue-600 uppercase bg-blue-50 px-3 py-1.5 rounded-full hover:bg-blue-100 transition-colors"
                >
                  Expliquer
                </button>
              )}
            </div>
            {isAiLoading ? (
               <div className="space-y-2 animate-pulse">
                 <div className="h-3 bg-slate-100 rounded w-full"></div>
                 <div className="h-3 bg-slate-100 rounded w-4/5"></div>
               </div>
            ) : aiExplanation ? (
              <p className="text-slate-600 text-sm leading-relaxed">{aiExplanation}</p>
            ) : (
              <p className="text-slate-400 text-xs italic text-center">Appuyez sur "Expliquer" pour des conseils mémos et grammaire.</p>
            )}
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col animate-in fade-in slide-in-from-right-4 duration-500">
          {quizScore === null ? (
            <Quiz 
              words={currentSelection} 
              direction={direction} 
              onComplete={(score) => setQuizScore(score)} 
            />
          ) : (
            <div className="text-center py-12 px-6 bg-white rounded-3xl shadow-lg border border-slate-100 flex flex-col items-center">
              <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-5xl mb-6 shadow-inner">🎉</div>
              <h2 className="text-3xl font-black text-slate-800 mb-2 tracking-tight">Quiz Terminé !</h2>
              <div className="text-7xl font-black text-blue-600 mb-8 mt-4">
                {quizScore}<span className="text-3xl text-slate-300">/10</span>
              </div>
              <div className="w-full space-y-3">
                <button 
                  onClick={() => setQuizScore(null)}
                  className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-100"
                >
                  Réessayer ce pack
                </button>
                <button 
                  onClick={resetAll}
                  className="w-full py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-colors"
                >
                  Retour au menu
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default App;
