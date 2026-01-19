
import React, { useState, useMemo } from 'react';
import { INITIAL_WORDS } from './constants';
import { AppStep, Activity, Category, Direction, RussianWord } from './types';
import Flashcard from './components/Flashcard';
import Quiz from './components/Quiz';

const shuffle = <T,>(array: T[]): T[] => {
  const newArr = [...array];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
};

const App: React.FC = () => {
  const [step, setStep] = useState<AppStep>('select-activity');
  const [activity, setActivity] = useState<Activity>('flashcards');
  const [category, setCategory] = useState<Category>('verbs');
  const [rangeIndex, setRangeIndex] = useState(0); 
  const [isRandomMode, setIsRandomMode] = useState(true);
  
  const [direction, setDirection] = useState<Direction>('RU_FR');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [quizScore, setQuizScore] = useState<number | null>(null);

  const currentSelection = useMemo(() => {
    let base = [...INITIAL_WORDS];
    if (category !== 'both') {
      base = base.filter(w => w.category === category);
    }
    
    const start = rangeIndex * 10;
    const end = start + 10;
    const sliced = base.slice(start, end);
    
    if (isRandomMode || activity === 'quiz') {
      return shuffle(sliced);
    }
    return sliced;
  }, [category, rangeIndex, step, isRandomMode, activity]);

  const currentWord = currentSelection[currentIndex];

  const resetAll = () => {
    setStep('select-activity');
    setQuizScore(null);
    setCurrentIndex(0);
    setIsRandomMode(true);
  };

  if (step === 'select-activity') {
    return (
      <div className="min-h-screen flex flex-col p-6 items-center justify-center">
        <div className="max-w-md w-full text-center mb-12">
          <div className="inline-block p-6 bg-[#FF6B6B] nb-border nb-shadow mb-8 -rotate-3">
            <h1 className="text-5xl font-black text-black tracking-tighter uppercase">
              Russe <br/> <span className="text-white">Flash!</span>
            </h1>
          </div>
          <p className="text-black font-black uppercase tracking-widest text-lg">Prêt à apprendre ?</p>
        </div>
        <div className="w-full max-w-sm space-y-6">
          <button 
            onClick={() => { setActivity('flashcards'); setStep('select-category'); }}
            className="w-full py-6 bg-[#F4E04D] nb-border nb-shadow text-3xl font-black text-black nb-press transition-all flex items-center justify-center gap-4"
          >
            <span className="text-5xl">🃏</span> 
            <span>CARTES</span>
          </button>
          <button 
            onClick={() => { setActivity('quiz'); setStep('select-category'); }}
            className="w-full py-6 bg-[#4D96FF] nb-border nb-shadow text-3xl font-black text-black nb-press transition-all flex items-center justify-center gap-4"
          >
            <span className="text-5xl">🧠</span> 
            <span>QUIZ</span>
          </button>
        </div>
      </div>
    );
  }

  if (step === 'select-category') {
    return (
      <div className="min-h-screen flex flex-col p-6 items-center justify-center">
        <button onClick={() => setStep('select-activity')} className="absolute top-6 left-6 bg-white nb-border nb-shadow-sm px-4 py-2 font-black text-black nb-press">
          ← RETOUR
        </button>
        <h2 className="text-4xl font-black text-black mb-10 text-center uppercase -rotate-1 bg-white nb-border p-2">Catégorie ?</h2>
        <div className="w-full max-w-sm space-y-3 pb-8">
          <button onClick={() => { setCategory('verbs'); setStep('select-range'); }} className="w-full p-4 bg-white nb-border nb-shadow font-black text-xl text-black nb-press flex justify-between items-center">
            <span>VERBES</span> <span className="bg-[#FF6B6B] p-2 text-xs text-white border-2 border-black">50</span>
          </button>
          <button onClick={() => { setCategory('nouns'); setStep('select-range'); }} className="w-full p-4 bg-white nb-border nb-shadow font-black text-xl text-black nb-press flex justify-between items-center">
            <span>NOMS</span> <span className="bg-[#4D96FF] p-2 text-xs text-white border-2 border-black">50</span>
          </button>
          <button onClick={() => { setCategory('glu'); setStep('select-range'); }} className="w-full p-4 bg-[#69db7c] nb-border nb-shadow font-black text-xl text-black nb-press flex justify-between items-center rotate-1">
            <span>LA GLU</span> <span className="bg-black p-2 text-xs text-white border-2 border-black">50</span>
          </button>
          <button onClick={() => { setCategory('numbers'); setStep('select-range'); }} className="w-full p-4 bg-[#A2D2FF] nb-border nb-shadow font-black text-xl text-black nb-press flex justify-between items-center">
            <span>CHIFFRES</span> <span className="bg-white p-2 text-xs text-black border-2 border-black">30+</span>
          </button>
          <button onClick={() => { setCategory('both'); setStep('select-range'); }} className="w-full p-4 bg-[#F4E04D] nb-border nb-shadow font-black text-xl text-black nb-press flex justify-between items-center rotate-[-1deg]">
            <span>MIXTE</span> <span className="bg-black p-2 text-xs text-white border-2 border-black">180+</span>
          </button>
        </div>
      </div>
    );
  }

  if (step === 'select-range') {
    const count = INITIAL_WORDS.filter(w => {
      if (category === 'both') return true;
      return w.category === category;
    }).length;
    const numPacks = Math.ceil(count / 10);
    const ranges = Array.from({length: numPacks}, (_, i) => `${i*10 + 1} - ${Math.min((i+1)*10, count)}`);

    return (
      <div className="min-h-screen flex flex-col p-6 items-center justify-center">
        <button onClick={() => setStep('select-category')} className="absolute top-6 left-6 bg-white nb-border nb-shadow-sm px-4 py-2 font-black text-black nb-press">
          ← RETOUR
        </button>
        <h2 className="text-3xl font-black text-black mb-6 text-center uppercase bg-white nb-border p-2 rotate-1">Quel pack ?</h2>
        
        {(category === 'numbers' || category === 'glu') && activity === 'flashcards' && (
          <div className="mb-6 flex items-center gap-4 bg-white nb-border p-3 nb-shadow-sm rotate-[-1deg]">
            <span className="font-black text-xs uppercase">Mode Ordre :</span>
            <button 
              onClick={() => setIsRandomMode(!isRandomMode)}
              className={`px-4 py-1 nb-border font-black text-xs transition-all ${!isRandomMode ? 'bg-[#FF6B6B] text-white' : 'bg-white text-black'}`}
            >
              {!isRandomMode ? 'ACTIF' : 'INACTIF'}
            </button>
          </div>
        )}

        <div className="w-full max-w-sm space-y-4 max-h-[50vh] overflow-y-auto px-2 pb-8">
          {ranges.map((label, idx) => (
            <button
              key={idx}
              onClick={() => { setRangeIndex(idx); setStep('game'); }}
              className="w-full p-5 bg-white nb-border nb-shadow font-black text-xl text-black nb-press flex justify-between items-center"
            >
              <span>PACK {idx + 1}</span>
              <span className="text-sm bg-black text-white px-2 py-1">{label}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col p-6 max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-8">
        <button onClick={resetAll} className="p-3 bg-white nb-border nb-shadow-sm text-black nb-press">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
        <div className="flex flex-col items-center bg-white nb-border px-4 py-1 rotate-1">
            <span className="text-xs font-black text-black uppercase tracking-tighter">
              {category === 'both' ? 'MIX' : category.toUpperCase()}
            </span>
            <span className="font-black text-black text-lg leading-tight">{activity === 'flashcards' ? 'CARTES' : 'QUIZ'}</span>
        </div>
        <button 
          onClick={() => setDirection(prev => prev === 'RU_FR' ? 'FR_RU' : 'RU_FR')}
          className="p-3 bg-[#FF6B6B] nb-border nb-shadow-sm text-white font-black text-sm nb-press"
        >
          {direction === 'RU_FR' ? 'RU/FR' : 'FR/RU'}
        </button>
      </div>

      {activity === 'flashcards' ? (
        <div className="flex-1 flex flex-col">
          {currentWord && <Flashcard word={currentWord} direction={direction} />}
          <div className="grid grid-cols-2 gap-6 mt-6">
            <button 
              onClick={() => setCurrentIndex((prev) => (prev - 1 + currentSelection.length) % currentSelection.length)}
              className="py-5 bg-white nb-border nb-shadow font-black text-black text-xl nb-press"
            >
              PRÉC.
            </button>
            <button 
              onClick={() => setCurrentIndex((prev) => (prev + 1) % currentSelection.length)}
              className="py-5 bg-[#4D96FF] nb-border nb-shadow font-black text-white text-xl nb-press"
            >
              SUIV.
            </button>
          </div>
          <div className="mt-8 text-center font-black text-black uppercase">
            {currentIndex + 1} / {currentSelection.length}
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col">
          {quizScore === null ? (
            <Quiz words={currentSelection} direction={direction} onComplete={(score) => setQuizScore(score)} />
          ) : (
            <div className="text-center py-12 px-6 bg-white nb-border nb-shadow flex flex-col items-center my-auto rotate-1">
              <div className="w-24 h-24 bg-[#F4E04D] nb-border flex items-center justify-center text-5xl mb-6 shadow-[4px_4px_0px_0px_#000]">🏆</div>
              <h2 className="text-4xl font-black text-black mb-2 uppercase italic tracking-tighter">TERMINE !</h2>
              <div className="text-8xl font-black text-[#4D96FF] mb-10 drop-shadow-[4px_4px_0px_#000]">
                {quizScore}<span className="text-3xl text-black">/10</span>
              </div>
              <div className="w-full space-y-4">
                <button onClick={() => { setQuizScore(null); setCurrentIndex(0); }} className="w-full py-4 bg-[#FF6B6B] text-white nb-border nb-shadow font-black text-xl nb-press uppercase">REJOUER</button>
                <button onClick={resetAll} className="w-full py-4 bg-white text-black nb-border nb-shadow font-black text-xl nb-press uppercase">MENU</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default App;
