
import React, { useState, useEffect } from 'react';
import { RussianWord, Direction } from '../types';

interface FlashcardProps {
  word: RussianWord;
  direction: Direction;
}

const Flashcard: React.FC<FlashcardProps> = ({ word, direction }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  useEffect(() => {
    setIsFlipped(false);
  }, [word]);

  const primary = direction === 'RU_FR' ? word.russian : word.french;
  const secondary = direction === 'RU_FR' ? word.french : word.russian;
  const phonetic = word.phonetic;

  return (
    <div 
      className="relative w-full h-80 perspective-1000 cursor-pointer mb-6"
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <div className={`relative w-full h-full transition-transform duration-500 preserve-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
        {/* Front */}
        <div className="absolute inset-0 flex flex-col items-center justify-center p-8 bg-white rounded-3xl shadow-xl border border-blue-100 backface-hidden">
          <span className="text-sm font-medium text-blue-500 uppercase tracking-wider mb-4">
            {direction === 'RU_FR' ? 'Russe' : 'Français'}
          </span>
          <h2 className="text-5xl font-bold text-gray-800 text-center">{primary}</h2>
          <p className="mt-8 text-sm text-gray-400">Cliquez pour voir la réponse</p>
        </div>

        {/* Back */}
        <div className="absolute inset-0 flex flex-col items-center justify-center p-8 bg-blue-50 rounded-3xl shadow-xl border border-blue-200 rotate-y-180 backface-hidden">
          <span className="text-sm font-medium text-blue-600 uppercase tracking-wider mb-4">
            Réponse
          </span>
          <h2 className="text-4xl font-bold text-gray-800 text-center mb-2">{secondary}</h2>
          <p className="text-xl text-blue-600 font-medium italic">[{phonetic}]</p>
          {word.example && (
            <div className="mt-6 p-3 bg-white/50 rounded-xl text-center">
              <p className="text-sm text-gray-600 italic">"{word.example}"</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Flashcard;
