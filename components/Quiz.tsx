
import React, { useState, useEffect } from 'react';
import { RussianWord, QuizQuestion, Direction } from '../types';

interface QuizProps {
  words: RussianWord[];
  direction: Direction;
  onComplete: (score: number) => void;
}

const Quiz: React.FC<QuizProps> = ({ words, direction, onComplete }) => {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);

  useEffect(() => {
    // Shuffle the source words for the quiz session
    const shuffledWords = [...words].sort(() => Math.random() - 0.5);
    
    const quizQuestions: QuizQuestion[] = shuffledWords.map((word) => {
      const isRUFR = direction === 'RU_FR';
      const correctAnswer = isRUFR ? word.french : word.russian;
      
      // Get 3 random distractors from the entire pool (to be more challenging)
      // Here we limit to the current set words for simplicity
      const otherWords = words.filter(w => w.id !== word.id);
      const shuffledOthers = [...otherWords].sort(() => 0.5 - Math.random());
      const distractors = shuffledOthers.slice(0, 3).map(w => isRUFR ? w.french : w.russian);
      
      const options = [correctAnswer, ...distractors].sort(() => 0.5 - Math.random());
      
      return { word, options, correctAnswer };
    });
    setQuestions(quizQuestions);
  }, [words, direction]);

  if (questions.length === 0) return <div>Chargement...</div>;

  const currentQ = questions[currentIndex];

  const handleOptionClick = (option: string) => {
    if (isAnswered) return;
    setSelectedOption(option);
    setIsAnswered(true);
    if (option === currentQ.correctAnswer) {
      setScore(score + 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      onComplete(score);
    }
  };

  const progress = ((currentIndex + 1) / questions.length) * 100;

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Progress Bar Neo-Brutalist */}
      <div className="w-full h-8 bg-white border-4 border-black mb-8 overflow-hidden nb-shadow-sm relative">
        <div 
          className="h-full bg-[#F4E04D] border-r-4 border-black transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
        <div className="absolute inset-0 flex items-center justify-center font-black text-xs mix-blend-difference">
           {currentIndex + 1} / {questions.length}
        </div>
      </div>

      <div className="bg-white p-6 nb-border nb-shadow mb-8 rotate-1">
        <h3 className="text-xs font-black text-black uppercase mb-4 text-center tracking-tighter">
          QUESTION SUIVANTE !
        </h3>
        <p className="text-5xl font-black text-center text-black mb-10 uppercase break-words leading-none">
          {direction === 'RU_FR' ? currentQ.word.russian : currentQ.word.french}
        </p>

        <div className="space-y-4">
          {currentQ.options.map((option, idx) => {
            let bgColor = "bg-white hover:bg-[#A2D2FF]";
            let textColor = "text-black";
            
            if (isAnswered) {
              if (option === currentQ.correctAnswer) {
                bgColor = "bg-[#4D96FF] text-white";
              } else if (option === selectedOption) {
                bgColor = "bg-[#FF6B6B] text-white";
              } else {
                bgColor = "bg-white opacity-40";
              }
            }

            return (
              <button
                key={idx}
                onClick={() => handleOptionClick(option)}
                disabled={isAnswered}
                className={`w-full p-4 text-left nb-border nb-shadow-sm transition-all font-black text-xl nb-press uppercase ${bgColor} ${textColor}`}
              >
                {option}
              </button>
            );
          })}
        </div>
      </div>

      {isAnswered && (
        <button
          onClick={handleNext}
          className="w-full py-5 bg-black text-white nb-border nb-shadow font-black text-2xl nb-press uppercase animate-bounce"
        >
          {currentIndex === questions.length - 1 ? 'VOIR SCORE !' : 'SUIVANT →'}
        </button>
      )}
    </div>
  );
};

export default Quiz;
