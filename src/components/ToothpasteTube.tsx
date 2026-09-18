import React, { useRef } from 'react';
import { motion } from 'motion/react';
import { ToothpasteStyle } from '../types';
import { Sparkles } from 'lucide-react';

interface ToothpasteTubeProps {
  isSqueezing: boolean;
  onSqueezeStart: (e: React.PointerEvent) => void;
  onSqueezeMove: (e: React.PointerEvent) => void;
  onSqueezeEnd: () => void;
  currentStyle: ToothpasteStyle;
  squeezeProgress: number; // 0 to 1 based on amount or long-press
}

export function ToothpasteTube({
  isSqueezing,
  onSqueezeStart,
  onSqueezeMove,
  onSqueezeEnd,
  currentStyle,
  squeezeProgress,
}: ToothpasteTubeProps) {
  const tubeRef = useRef<HTMLDivElement>(null);

  // Derive gradient or stripes for the decorative stripe on the tube body
  const tubeGradient =
    currentStyle.colors.length > 1
      ? `linear-gradient(90deg, ${currentStyle.colors.join(', ')})`
      : currentStyle.colors[0] || '#00C4FF';

  return (
    <div className="relative flex flex-col items-center justify-center select-none">
      {/* Current Flavor Badge */}
      <motion.div
        animate={{ scale: isSqueezing ? 1.05 : 1 }}
        className="mb-2 px-3.5 py-1 rounded-full bg-white/90 backdrop-blur-md shadow-sm border border-slate-200/80 flex items-center gap-2"
      >
        <span
          className="w-3.5 h-3.5 rounded-full shadow-inner inline-block"
          style={{
            background: tubeGradient,
          }}
        />
        <span className="text-xs sm:text-sm font-semibold text-slate-700">
          {currentStyle.nameZh} · <span className="font-normal text-slate-500">{currentStyle.name}</span>
        </span>
        <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
      </motion.div>

      {/* Interactive Squeezable Tube Area */}
      <div
        ref={tubeRef}
        id="toothpaste-tube"
        onPointerDown={onSqueezeStart}
        onPointerMove={onSqueezeMove}
        onPointerUp={onSqueezeEnd}
        onPointerCancel={onSqueezeEnd}
        className="relative cursor-pointer touch-none active:cursor-grabbing p-4 group"
        title="Click or press and drag to squeeze toothpaste!"
      >
        {/* Glowing aura when active */}
        <motion.div
          animate={{
            scale: isSqueezing ? [1, 1.08, 1] : 1,
            opacity: isSqueezing ? 0.45 : 0.15,
          }}
          transition={{ repeat: isSqueezing ? Infinity : 0, duration: 0.8 }}
          className="absolute inset-0 rounded-3xl blur-xl"
          style={{
            background: tubeGradient,
          }}
        />

        {/* SVG Toothpaste Tube */}
        <motion.div
          animate={
            isSqueezing
              ? {
                  scaleX: 0.92,
                  scaleY: 0.94,
                  y: [0, -3, 0],
                }
              : {
                  scaleX: 1,
                  scaleY: 1,
                  y: [0, -2, 0],
                }
          }
          transition={{
            y: { repeat: Infinity, duration: isSqueezing ? 0.3 : 2.5, ease: 'easeInOut' },
            scaleX: { duration: 0.15 },
            scaleY: { duration: 0.15 },
          }}
          className="relative w-64 sm:w-72 md:w-80 h-auto filter drop-shadow-md"
        >
          <svg viewBox="0 0 280 320" className="w-full h-auto overflow-visible">
            <defs>
              {/* Tube body linear gradient */}
              <linearGradient id="tubeBodyBg" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="30%" stopColor="#F4F8FC" />
                <stop offset="70%" stopColor="#E3EEFA" />
                <stop offset="100%" stopColor="#D4E4F5" />
              </linearGradient>

              {/* Cap & neck gradient */}
              <linearGradient id="capGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#48DBFB" />
                <stop offset="50%" stopColor="#0ABDE3" />
                <stop offset="100%" stopColor="#0097E6" />
              </linearGradient>

              {/* Crimped end pattern */}
              <pattern id="crimpPattern" width="12" height="12" patternUnits="userSpaceOnUse">
                <line x1="0" y1="0" x2="0" y2="12" stroke="#94A3B8" strokeWidth="2" strokeDasharray="3,3" />
              </pattern>

              {/* Striped ribbon fill inside tube body */}
              <linearGradient id="tubeStripeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                {currentStyle.colors.map((c, idx) => (
                  <stop
                    key={idx}
                    offset={`${(idx / Math.max(1, currentStyle.colors.length - 1)) * 100}%`}
                    stopColor={c}
                  />
                ))}
              </linearGradient>
            </defs>

            {/* 1. Crimped Top Seal (Folded metal/plastic seal) */}
            <path
              d="M 50 40 L 230 40 C 235 40, 238 46, 235 52 L 230 65 L 50 65 L 45 52 C 42 46, 45 40, 50 40 Z"
              fill="#CBD5E1"
              stroke="#64748B"
              strokeWidth="3"
            />
            {/* Crimp textured ridges */}
            <path d="M 60 40 L 60 65 M 80 40 L 80 65 M 100 40 L 100 65 M 120 40 L 120 65 M 140 40 L 140 65 M 160 40 L 160 65 M 180 40 L 180 65 M 200 40 L 200 65 M 220 40 L 220 65"
              stroke="#94A3B8" strokeWidth="2.5" strokeLinecap="round" />

            {/* 2. Tube Main Body (Large, friendly squishy cylinder) */}
            {/* The control points deform inward dynamically when squeezed */}
            <path
              d={
                isSqueezing
                  ? 'M 50 65 C 68 130, 80 180, 105 230 L 175 230 C 200 180, 212 130, 230 65 Z'
                  : 'M 50 65 C 56 125, 68 185, 102 230 L 178 230 C 212 185, 224 125, 230 65 Z'
              }
              fill="url(#tubeBodyBg)"
              stroke="#334155"
              strokeWidth="4.5"
              strokeLinejoin="round"
            />

            {/* Squeeze indentation lines when pressed */}
            {isSqueezing && (
              <g opacity="0.6">
                <path d="M 86 140 C 105 155, 125 155, 140 145" fill="none" stroke="#94A3B8" strokeWidth="3" strokeLinecap="round" />
                <path d="M 150 148 C 165 156, 180 152, 194 138" fill="none" stroke="#94A3B8" strokeWidth="3" strokeLinecap="round" />
              </g>
            )}

            {/* Decorative Colorful Wave / Swirl on Tube Body */}
            <path
              d={
                isSqueezing
                  ? 'M 72 105 Q 140 150 208 105 L 200 140 Q 140 185 80 140 Z'
                  : 'M 65 105 Q 140 145 215 105 L 206 142 Q 140 180 74 142 Z'
              }
              fill="url(#tubeStripeGrad)"
              opacity="0.92"
            />

            {/* Shiny Body Highlight */}
            <path
              d="M 68 75 C 72 120, 85 170, 110 205"
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="8"
              strokeLinecap="round"
              opacity="0.65"
            />

            {/* English Word "toothpaste" Banner printed on tube */}
            <g transform="translate(140, 122)">
              <rect x="-65" y="-14" width="130" height="28" rx="14" fill="#FFFFFF" stroke="#334155" strokeWidth="2.5" />
              <text
                x="0"
                y="5"
                textAnchor="middle"
                fill="#1E293B"
                fontSize="15"
                fontWeight="800"
                letterSpacing="1.2"
                style={{ fontFamily: "'Fredoka', sans-serif" }}
              >
                TOOTHPASTE
              </text>
            </g>

            {/* Cute Kawaii Face on the Tube */}
            <g transform="translate(140, 178)">
              {isSqueezing ? (
                // Squeezing face: Cute squint eyes and round "O" squish mouth
                <>
                  {/* Left Squint Eye */}
                  <path d="M -30 -4 L -22 2 L -14 -4" fill="none" stroke="#1E293B" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
                  {/* Right Squint Eye */}
                  <path d="M 14 -4 L 22 2 L 30 -4" fill="none" stroke="#1E293B" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
                  {/* Open Squishing Mouth "O" */}
                  <ellipse cx="0" cy="8" rx="8" ry="10" fill="#FF5252" stroke="#1E293B" strokeWidth="3" />
                  <ellipse cx="0" cy="11" rx="5" ry="4" fill="#FF7675" />
                </>
              ) : (
                // Normal Happy Face: Big twinkly eyes and cheerful smile
                <>
                  {/* Left Eye */}
                  <circle cx="-22" cy="-2" r="6" fill="#1E293B" />
                  <circle cx="-24" cy="-4" r="2.2" fill="#FFFFFF" />
                  {/* Right Eye */}
                  <circle cx="22" cy="-2" r="6" fill="#1E293B" />
                  <circle cx="20" cy="-4" r="2.2" fill="#FFFFFF" />
                  {/* Sweet Smile */}
                  <path d="M -9 6 Q 0 14 9 6" fill="none" stroke="#1E293B" strokeWidth="3" strokeLinecap="round" />
                </>
              )}

              {/* Blushing Cheeks */}
              <ellipse cx="-34" cy="5" rx="7" ry="4" fill="#FF7675" opacity="0.6" />
              <ellipse cx="34" cy="5" rx="7" ry="4" fill="#FF7675" opacity="0.6" />
            </g>

            {/* 3. Neck & Threaded Collar */}
            <rect x="110" y="230" width="60" height="15" rx="4" fill="#CBD5E1" stroke="#334155" strokeWidth="3.5" />
            {/* Thread ridges */}
            <line x1="112" y1="235" x2="168" y2="235" stroke="#94A3B8" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="112" y1="240" x2="168" y2="240" stroke="#94A3B8" strokeWidth="2.5" strokeLinecap="round" />

            {/* 4. Nozzle Tip (Opening where paste squirts out) */}
            <path
              d="M 118 245 L 126 270 L 154 270 L 162 245 Z"
              fill="url(#capGrad)"
              stroke="#334155"
              strokeWidth="3.5"
            />
            {/* Opening ring hole */}
            <ellipse cx="140" cy="270" rx="14" ry="5.5" fill="#1E293B" stroke="#0097E6" strokeWidth="2" />

            {/* Emergent Paste droplet preview at the nozzle orifice */}
            <path
              d="M 129 270 C 128 284, 152 284, 151 270 Z"
              fill="url(#tubeStripeGrad)"
              stroke="#334155"
              strokeWidth="2"
            />
          </svg>
        </motion.div>

        {/* Floating Instruction / Action Pill */}
        <div className="mt-1 flex flex-col items-center">
          <motion.div
            animate={{
              scale: isSqueezing ? 0.95 : [1, 1.05, 1],
              boxShadow: isSqueezing
                ? '0 0 0 rgba(0,0,0,0)'
                : '0 4px 14px rgba(56, 189, 248, 0.35)',
            }}
            transition={{ repeat: Infinity, duration: 1.8 }}
            className={`px-4 py-1.5 rounded-full text-xs sm:text-sm font-bold tracking-wide transition-all shadow-md flex items-center gap-2 ${
              isSqueezing
                ? 'bg-amber-400 text-amber-950 scale-95'
                : 'bg-sky-500 text-white hover:bg-sky-600'
            }`}
          >
            <span>{isSqueezing ? '💦 正在挤牙膏中... (Squeezing!)' : '👆 点击或长按拖动挤牙膏'}</span>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
