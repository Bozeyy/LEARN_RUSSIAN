
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
      className="relative w-full h-96 perspective-1000 cursor-pointer"
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <div className={`relative w-full h-full transition-transform duration-500 preserve-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
        {/* Front */}
        <div className="absolute inset-0 flex flex-col items-center justify-center p-8 bg-white nb-border nb-shadow backface-hidden">
          <span className="bg-[#4D96FF] px-4 py-1 text-sm font-black text-white uppercase border-2 border-black mb-6">
            {direction === 'RU_FR' ? 'RUSSE' : 'FRANÇAIS'}
          </span>
          <h2 className="text-6xl font-black text-black text-center break-words w-full uppercase leading-none">{primary}</h2>
          <div className="mt-12 bg-[#F4E04D] px-4 py-2 nb-border text-sm font-black italic">CLIQUE ICI POUR LA TRADUCTION !</div>
        </div>

        {/* Back */}
        <div className="absolute inset-0 flex flex-col items-center justify-center p-8 bg-[#A2D2FF] nb-border nb-shadow rotate-y-180 backface-hidden">
          <span className="bg-black px-4 py-1 text-sm font-black text-white uppercase border-2 border-black mb-6">
            TRADUCTION
          </span>
          <h2 className="text-5xl font-black text-black text-center mb-4 uppercase">{secondary}</h2>
          <div className="bg-white nb-border px-4 py-2 font-black text-2xl text-[#FF6B6B]">
            [{phonetic}]
          </div>
          {word.example && (
            <div className="mt-8 p-4 bg-white border-4 border-black border-dashed">
              <p className="text-lg text-black font-bold italic">"{word.example}"</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Flashcard;
