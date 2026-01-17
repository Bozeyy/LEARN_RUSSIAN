
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
    const quizQuestions: QuizQuestion[] = words.map((word) => {
      const isRUFR = direction === 'RU_FR';
      const correctAnswer = isRUFR ? word.french : word.russian;
      
      // Get 3 random distractors
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
      {/* Progress Bar */}
      <div className="w-full h-2 bg-gray-200 rounded-full mb-8 overflow-hidden">
        <div 
          className="h-full bg-blue-600 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="bg-white p-6 rounded-3xl shadow-lg border border-gray-100 mb-6">
        <h3 className="text-sm font-semibold text-gray-400 uppercase mb-4 text-center">
          Question {currentIndex + 1} / {questions.length}
        </h3>
        <p className="text-3xl font-bold text-center text-gray-800 mb-8">
          {direction === 'RU_FR' ? currentQ.word.russian : currentQ.word.french}
        </p>

        <div className="space-y-3">
          {currentQ.options.map((option, idx) => {
            let bgColor = "bg-gray-50 border-gray-100 hover:border-blue-400";
            if (isAnswered) {
              if (option === currentQ.correctAnswer) bgColor = "bg-green-100 border-green-500 text-green-700";
              else if (option === selectedOption) bgColor = "bg-red-100 border-red-500 text-red-700";
              else bgColor = "bg-gray-50 border-gray-100 opacity-50";
            }

            return (
              <button
                key={idx}
                onClick={() => handleOptionClick(option)}
                disabled={isAnswered}
                className={`w-full p-4 text-left rounded-2xl border-2 transition-all font-medium ${bgColor}`}
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
          className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-lg hover:bg-blue-700 transition-colors"
        >
          {currentIndex === questions.length - 1 ? 'Voir le score' : 'Question suivante'}
        </button>
      )}
    </div>
  );
};

export default Quiz;
