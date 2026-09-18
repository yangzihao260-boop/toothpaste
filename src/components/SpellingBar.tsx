import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Volume2, Sparkles, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundCtrl } from '../utils/audio';

interface SpellingBarProps {
  squeezeCount: number;
  onPronounce: () => void;
}

const LETTERS = ['T', 'O', 'O', 'T', 'H', 'P', 'A', 'S', 'T', 'E'];

export function SpellingBar({ squeezeCount, onPronounce }: SpellingBarProps) {
  const [activeBounceIdx, setActiveBounceIdx] = useState<number | null>(null);

  // How many letters are unlocked based on squeezeCount (cycles or completes at 10)
  const unlockedLettersCount = Math.min(LETTERS.length, squeezeCount % (LETTERS.length + 1) === 0 && squeezeCount > 0 ? LETTERS.length : squeezeCount % (LETTERS.length + 1));
  const isComplete = squeezeCount > 0 && squeezeCount % LETTERS.length === 0;

  const handleLetterTap = (idx: number) => {
    setActiveBounceIdx(idx);
    setTimeout(() => setActiveBounceIdx(null), 600);
    // REMINDER: Strictly NO letter pronunciation per requirement. Only "toothpaste" is ever spoken aloud.
  };

  const handleCelebration = () => {
    confetti({
      particleCount: 50,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#00B4D8', '#FF3366', '#2ECC71', '#FFAA00', '#A06CD5'],
    });
  };

  return (
    <div className="w-full max-w-2xl px-4 py-3 sm:py-4 bg-white/90 backdrop-blur-md rounded-2xl shadow-sm border border-slate-200/90 flex flex-col items-center">
      {/* Top Bar: Word Header, Phonetics, and Pronunciation Speaker Button */}
      <div className="w-full flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="flex items-baseline gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">
              toothpaste
            </h1>
            <span className="text-sm sm:text-base font-semibold text-slate-400">
              /ˈtuːθpeɪst/
            </span>
          </div>
          <span className="px-2 py-0.5 rounded-md bg-sky-100 text-sky-800 text-xs font-bold">
            n. 牙膏
          </span>
        </div>

        {/* Big Clean Pronunciation Button */}
        <button
          onClick={onPronounce}
          id="pronounce-word-btn"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white text-xs sm:text-sm font-bold shadow-xs transition-all cursor-pointer"
          title="Listen to pronunciation: toothpaste"
        >
          <Volume2 className="w-4 h-4 animate-bounce" />
          <span>读音 (toothpaste)</span>
        </button>
      </div>

      {/* Syllable Compound Breakdown Guide (For Elementary English Learners) */}
      <div className="w-full my-2.5 flex items-center justify-center gap-2 text-xs sm:text-sm">
        <span className="px-2.5 py-1 rounded-lg bg-teal-50 border border-teal-200 text-teal-800 font-bold">
          tooth <span className="text-teal-600 font-normal">/tuːθ/ 牙齿</span>
        </span>
        <span className="text-slate-400 font-bold">+</span>
        <span className="px-2.5 py-1 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-800 font-bold">
          paste <span className="text-indigo-600 font-normal">/peɪst/ 膏状物</span>
        </span>
        <span className="text-slate-400 font-bold">=</span>
        <span className="px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 font-bold">
          toothpaste <span className="text-amber-700 font-normal">牙膏</span>
        </span>
      </div>

      {/* 10 Interactive Spelling Tiles: T - O - O - T - H - P - A - S - T - E */}
      <div className="w-full flex items-center justify-center gap-1 sm:gap-2 mt-1">
        {LETTERS.map((letter, idx) => {
          const isToothPart = idx < 5; // T-O-O-T-H
          const isUnlocked = idx < unlockedLettersCount;
          const isBouncing = activeBounceIdx === idx;

          return (
            <motion.button
              key={idx}
              id={`letter-tile-${idx}`}
              onClick={() => handleLetterTap(idx)}
              animate={
                isBouncing
                  ? { y: [-12, 0], scale: [1.2, 1] }
                  : isUnlocked
                  ? { scale: [1, 1.06, 1] }
                  : {}
              }
              transition={{ duration: 0.3 }}
              className={`relative flex flex-col items-center justify-center w-7 h-10 sm:w-10 sm:h-14 rounded-xl font-black text-sm sm:text-xl transition-all cursor-pointer select-none ${
                isUnlocked
                  ? isToothPart
                    ? 'bg-teal-500 text-white shadow-md shadow-teal-200 border-2 border-teal-600'
                    : 'bg-indigo-500 text-white shadow-md shadow-indigo-200 border-2 border-indigo-600'
                  : 'bg-slate-100 text-slate-400 border border-slate-200 hover:bg-slate-200/70'
              }`}
              title={`Letter ${letter} (${isUnlocked ? 'Collected' : 'Squeeze toothpaste to collect!'})`}
            >
              <span>{letter}</span>

              {/* Little dollop droplet indicator on unlocked letters */}
              {isUnlocked && (
                <span className="absolute -bottom-1 w-2 h-2 rounded-full bg-amber-300 border border-amber-500" />
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Progress & Milestone hint */}
      <div className="mt-2.5 text-xs text-slate-500 flex items-center gap-1.5">
        {unlockedLettersCount === LETTERS.length ? (
          <span className="text-emerald-600 font-bold flex items-center gap-1">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            太棒啦！成功拼写出完整的 toothpaste！
          </span>
        ) : (
          <span>
            拼写进度：每挤一次牙膏点亮一个字母 ({unlockedLettersCount}/{LETTERS.length})
          </span>
        )}
      </div>
    </div>
  );
}
