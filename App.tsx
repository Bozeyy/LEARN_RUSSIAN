
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
  const [rangeIndex, setRangeIndex] = useState(0); // 0=1-10, 1=11-20, etc.
  
  const [direction, setDirection] = useState<Direction>('RU_FR');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [quizScore, setQuizScore] = useState<number | null>(null);
  const [aiExplanation, setAiExplanation] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Derive words based on category and range
  const currentSelection = useMemo(() => {
    let base = INITIAL_WORDS;
    if (category === 'verbs') base = base.filter(w => w.category === 'verbs');
    else if (category === 'nouns') base = base.filter(w => w.category === 'nouns');
    
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

  const startNextStep = () => {
    if (step === 'select-activity') setStep('select-category');
    else if (step === 'select-category') setStep('select-range');
    else if (step === 'select-range') setStep('game');
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
    const expl = await getWordExplanation(currentWord.russian, category);
    setAiExplanation(expl);
    setIsAiLoading(false);
  };

  const toggleDirection = () => {
    setDirection(prev => prev === 'RU_FR' ? 'FR_RU' : 'RU_FR');
  };

  // --- RENDERING SCREENS ---

  if (step === 'select-activity') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col p-6 items-center justify-center">
        <div className="max-w-md w-full text-center mb-12">
          <h1 className="text-4xl font-extrabold text-slate-800 tracking-tight mb-2">Apprendre le Russe</h1>
          <p className="text-slate-500 font-medium italic">Choisissez votre méthode</p>
        </div>
        <div className="w-full max-w-sm space-y-4">
          <button 
            onClick={() => { setActivity('flashcards'); startNextStep(); }}
            className="w-full py-8 bg-white border-2 border-slate-100 hover:border-blue-500 rounded-3xl text-2xl font-bold text-slate-700 shadow-sm transition-all flex items-center justify-center gap-4 group"
          >
            <span className="text-4xl group-hover:scale-110 transition-transform">🃏</span> 
            <span>Flashcards</span>
          </button>
          <button 
            onClick={() => { setActivity('quiz'); startNextStep(); }}
            className="w-full py-8 bg-white border-2 border-slate-100 hover:border-blue-500 rounded-3xl text-2xl font-bold text-slate-700 shadow-sm transition-all flex items-center justify-center gap-4 group"
          >
            <span className="text-4xl group-hover:scale-110 transition-transform">🧠</span> 
            <span>Quiz Interactif</span>
          </button>
        </div>
      </div>
    );
  }

  if (step === 'select-category') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col p-6 items-center justify-center">
        <button onClick={() => setStep('select-activity')} className="absolute top-6 left-6 text-slate-400 hover:text-slate-600 flex items-center gap-2 font-bold">
          ← Retour
        </button>
        <h2 className="text-2xl font-bold text-slate-800 mb-8">Quel type de mots ?</h2>
        <div className="w-full max-w-sm space-y-3">
          {(['verbs', 'nouns', 'both'] as Category[]).map(cat => (
            <button
              key={cat}
              onClick={() => { setCategory(cat); startNextStep(); }}
              className="w-full p-6 bg-white rounded-2xl border-2 border-slate-100 hover:border-blue-500 font-bold text-lg text-slate-700 capitalize shadow-sm transition-all"
            >
              {cat === 'verbs' ? 'Les Verbes' : cat === 'nouns' ? 'Les Noms' : 'Mélange (Noms & Verbes)'}
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (step === 'select-range') {
    const ranges = ["1 - 10", "11 - 20", "21 - 30", "31 - 40", "41 - 50"];
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col p-6 items-center justify-center overflow-y-auto">
        <button onClick={() => setStep('select-category')} className="absolute top-6 left-6 text-slate-400 hover:text-slate-600 flex items-center gap-2 font-bold">
          ← Retour
        </button>
        <h2 className="text-2xl font-bold text-slate-800 mb-6 mt-12">Choisissez le pack</h2>
        <div className="w-full max-w-sm space-y-3 pb-12">
          {ranges.map((label, idx) => (
            <button
              key={idx}
              onClick={() => { setRangeIndex(idx); startNextStep(); }}
              className="w-full p-5 bg-white rounded-2xl border-2 border-slate-100 hover:border-blue-500 font-bold text-slate-700 shadow-sm transition-all flex justify-between items-center"
            >
              <span>Mots {label}</span>
              <span className="text-blue-500">→</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // --- GAME SCREEN ---
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col p-6 max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-4">
        <button 
          onClick={resetAll}
          className="p-3 bg-white rounded-2xl shadow-sm border border-slate-100 text-slate-600 hover:text-blue-600"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
        <div className="flex flex-col items-center">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              {category === 'both' ? 'Mix' : category === 'verbs' ? 'Verbes' : 'Noms'} • {rangeIndex*10+1}-{rangeIndex*10+10}
            </span>
            <span className="font-bold text-slate-800">{activity === 'flashcards' ? 'Flashcards' : 'Quiz'}</span>
        </div>
        <button 
          onClick={toggleDirection}
          className="p-2 px-3 bg-blue-50 text-blue-600 rounded-xl font-bold text-xs border border-blue-100 shadow-sm hover:bg-blue-100 transition-all"
        >
          {direction === 'RU_FR' ? 'RU → FR' : 'FR → RU'}
        </button>
      </div>

      {activity === 'flashcards' ? (
        <div className="flex-1 flex flex-col">
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
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <span className="text-blue-500">✨</span> Assistant IA
              </h3>
              {!aiExplanation && !isAiLoading && (
                <button 
                  onClick={askGemini}
                  className="text-xs font-bold text-blue-600 uppercase bg-blue-50 px-3 py-1 rounded-full"
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
              <p className="text-slate-400 text-xs italic text-center">Besoin d'aide pour retenir ce mot ? Cliquez sur "Expliquer".</p>
            )}
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col">
          {quizScore === null ? (
            <Quiz 
              words={currentSelection} 
              direction={direction} 
              onComplete={(score) => setQuizScore(score)} 
            />
          ) : (
            <div className="text-center py-12 px-6 bg-white rounded-3xl shadow-lg border border-slate-100 flex flex-col items-center">
              <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-5xl mb-6">🎉</div>
              <h2 className="text-3xl font-bold text-slate-800 mb-2">Quiz Terminé !</h2>
              <div className="text-6xl font-black text-blue-600 mb-8 mt-4">
                {quizScore} <span className="text-2xl text-slate-300">/ 10</span>
              </div>
              <div className="w-full space-y-3">
                <button 
                  onClick={() => setQuizScore(null)}
                  className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-colors shadow-lg"
                >
                  Réessayer ce pack
                </button>
                <button 
                  onClick={resetAll}
                  className="w-full py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-colors"
                >
                  Changer de catégorie
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
