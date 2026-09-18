import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ToothpasteStyle, PasteSegment } from '../types';
import { Sparkles, RefreshCw } from 'lucide-react';

interface ToothbrushWithPasteProps {
  isSqueezing: boolean;
  currentStyle: ToothpasteStyle;
  segments: PasteSegment[];
  extrusionStreamProgress: number; // 0 to 1
  dragOffset: { x: number; y: number };
  onResetBrush: () => void;
}

export function ToothbrushWithPaste({
  isSqueezing,
  currentStyle,
  segments,
  extrusionStreamProgress,
  dragOffset,
  onResetBrush,
}: ToothbrushWithPasteProps) {
  // Brush head dimensions & position
  const brushWidth = 320;
  const brushHeight = 160;

  // Derive gradient for active extrusion ribbon
  const streamGradientId = `active-stream-grad-${currentStyle.id}`;

  return (
    <div className="relative w-full max-w-xl flex flex-col items-center justify-center select-none mt-1 sm:mt-2">
      {/* Dynamic Squeezing Extrusion Ribbon connecting tube to brush */}
      <div className="absolute -top-16 sm:-top-20 w-full h-24 sm:h-28 pointer-events-none z-20 flex justify-center">
        {isSqueezing && (
          <svg className="w-64 sm:w-80 h-full overflow-visible">
            <defs>
              <linearGradient id={streamGradientId} x1="0%" y1="0%" x2="100%" y2="0%">
                {currentStyle.colors.map((c, idx) => (
                  <stop
                    key={idx}
                    offset={`${(idx / Math.max(1, currentStyle.colors.length - 1)) * 100}%`}
                    stopColor={c}
                  />
                ))}
              </linearGradient>

              {/* Striped pattern for extrusion stream */}
              <linearGradient id={`${streamGradientId}-vert`} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.8" />
                <stop offset="30%" stopColor="#FFFFFF" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#000000" stopOpacity="0.1" />
              </linearGradient>
            </defs>

            {/* Main Extrusion Flow Path */}
            {/* Starts near center top (nozzle: x=140 or offset), sways with dragOffset.x, reaches brush head at bottom */}
            {(() => {
              const startX = 140 + dragOffset.x * 0.4;
              const startY = 4;
              const endX = 140 + (dragOffset.x * 0.7);
              const endY = 88;
              const ctrl1X = startX + (dragOffset.x * 0.2);
              const ctrl1Y = 35;
              const ctrl2X = endX - 10;
              const ctrl2Y = 65;

              return (
                <g>
                  {/* Outer Stroke / Shadow */}
                  <path
                    d={`M ${startX - 11} ${startY} C ${ctrl1X - 14} ${ctrl1Y}, ${ctrl2X - 14} ${ctrl2Y}, ${endX - 14} ${endY} 
                        L ${endX + 14} ${endY} C ${ctrl2X + 14} ${ctrl2Y}, ${ctrl1X + 14} ${ctrl1Y}, ${startX + 11} ${startY} Z`}
                    fill={`url(#${streamGradientId})`}
                    stroke="#1E293B"
                    strokeWidth="3.5"
                    strokeLinejoin="round"
                  />

                  {/* Individual Striping Layer */}
                  {currentStyle.colors.map((col, idx) => {
                    const count = currentStyle.colors.length;
                    const offsetPct = (idx / count) - 0.5;
                    const spread = 20 * offsetPct;
                    return (
                      <path
                        key={idx}
                        d={`M ${startX + spread - 3} ${startY} C ${ctrl1X + spread - 3} ${ctrl1Y}, ${ctrl2X + spread - 3} ${ctrl2Y}, ${endX + spread - 3} ${endY} 
                            L ${endX + spread + 3} ${endY} C ${ctrl2X + spread + 3} ${ctrl2Y}, ${ctrl1X + spread + 3} ${ctrl1Y}, ${startX + spread + 3} ${startY} Z`}
                        fill={col}
                        opacity={0.85}
                      />
                    );
                  })}

                  {/* Glossy White Center Specular Shine */}
                  <path
                    d={`M ${startX - 2} ${startY + 6} C ${ctrl1X - 2} ${ctrl1Y}, ${ctrl2X - 2} ${ctrl2Y}, ${endX - 2} ${endY - 6}`}
                    fill="none"
                    stroke="#FFFFFF"
                    strokeWidth="5"
                    strokeLinecap="round"
                    opacity="0.8"
                  />

                  {/* Tiny sparkling star floating along stream */}
                  <circle cx={ctrl1X + 10} cy={ctrl1Y + 5} r="2.5" fill="#FFFFFF" opacity="0.9" />
                  <circle cx={ctrl2X - 8} cy={ctrl2Y} r="3" fill="#FFFFFF" opacity="0.9" />
                </g>
              );
            })()}
          </svg>
        )}
      </div>

      {/* Main Toothbrush Container */}
      <div className="relative w-full flex flex-col items-center">
        {/* Reset / Wash Toothbrush Button */}
        {segments.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute -top-7 right-3 sm:right-8 z-30"
          >
            <button
              onClick={onResetBrush}
              id="wash-toothbrush-btn"
              className="px-3 py-1.5 rounded-full bg-white/95 hover:bg-sky-50 text-sky-700 text-xs sm:text-sm font-bold shadow-md border border-sky-200 flex items-center gap-1.5 transition-transform hover:scale-105 active:scale-95 cursor-pointer"
              title="Wash and clear the toothbrush to try new colors!"
            >
              <RefreshCw className="w-3.5 h-3.5 text-sky-500 animate-spin-reverse" />
              <span>洗洗牙刷 (Wash)</span>
            </button>
          </motion.div>
        )}

        {/* Toothbrush & Paste Mound SVG */}
        <div className="relative w-72 sm:w-96 md:w-[440px] h-36 sm:h-44">
          <svg viewBox="0 0 440 180" className="w-full h-full overflow-visible filter drop-shadow-lg">
            <defs>
              {/* Handle Gradient */}
              <linearGradient id="handleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#A8EDEA" />
                <stop offset="50%" stopColor="#FED6E3" />
                <stop offset="100%" stopColor="#D299C2" />
              </linearGradient>

              {/* Handle Rubber Grip */}
              <linearGradient id="gripGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#48DBFB" />
                <stop offset="100%" stopColor="#0ABDE3" />
              </linearGradient>

              {/* Bristles Gradient */}
              <linearGradient id="bristlesGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="85%" stopColor="#E0F2FE" />
                <stop offset="100%" stopColor="#BAE6FD" />
              </linearGradient>

              {/* Bristle Highlight Stripe */}
              <linearGradient id="accentBristles" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#38BDF8" />
                <stop offset="100%" stopColor="#0284C7" />
              </linearGradient>
            </defs>

            {/* 1. Toothbrush Handle & Neck (Points to the right, head on the left under nozzle) */}
            {/* Long ergonomic stem */}
            <path
              d="M 120 120 
                 C 160 115, 200 110, 240 118 
                 C 280 125, 360 145, 415 138 
                 C 430 135, 435 152, 420 156 
                 C 360 168, 270 145, 220 138 
                 C 180 132, 140 134, 110 132 Z"
              fill="url(#handleGrad)"
              stroke="#334155"
              strokeWidth="4"
              strokeLinejoin="round"
            />

            {/* Grip Oval Pads */}
            <g transform="translate(290, 130) rotate(10)">
              <ellipse cx="0" cy="0" rx="28" ry="7" fill="url(#gripGrad)" stroke="#334155" strokeWidth="2.5" />
              <line x1="-16" y1="-3" x2="-16" y2="3" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
              <line x1="-6" y1="-4" x2="-6" y2="4" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
              <line x1="4" y1="-4" x2="4" y2="4" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
              <line x1="14" y1="-3" x2="14" y2="3" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
            </g>

            {/* Little star on the handle tip */}
            <g transform="translate(410, 145)">
              <circle cx="0" cy="0" r="4" fill="#FEE140" stroke="#334155" strokeWidth="1.5" />
            </g>

            {/* 2. Brush Head (Under the toothpaste tube nozzle: x=50 to 160) */}
            {/* Plastic head plate */}
            <path
              d="M 50 118 C 42 118, 36 124, 38 132 C 40 138, 48 142, 60 142 L 120 132 C 124 130, 126 124, 120 120 Z"
              fill="#FFFFFF"
              stroke="#334155"
              strokeWidth="3.5"
            />

            {/* 3. Soft Bristles Tufting (Base under paste) */}
            {/* Multi-layered soft bristle groups */}
            <g id="bristles">
              {/* Back Row */}
              <rect x="46" y="80" width="12" height="42" rx="4" fill="url(#bristlesGrad)" stroke="#CBD5E1" strokeWidth="1.5" />
              <rect x="59" y="78" width="12" height="44" rx="4" fill="url(#accentBristles)" stroke="#0284C7" strokeWidth="1.5" />
              <rect x="72" y="76" width="12" height="46" rx="4" fill="url(#bristlesGrad)" stroke="#CBD5E1" strokeWidth="1.5" />
              <rect x="85" y="76" width="12" height="46" rx="4" fill="url(#accentBristles)" stroke="#0284C7" strokeWidth="1.5" />
              <rect x="98" y="78" width="12" height="44" rx="4" fill="url(#bristlesGrad)" stroke="#CBD5E1" strokeWidth="1.5" />
              <rect x="111" y="82" width="11" height="40" rx="4" fill="url(#bristlesGrad)" stroke="#CBD5E1" strokeWidth="1.5" />

              {/* Bristle texture lines */}
              <line x1="52" y1="84" x2="52" y2="114" stroke="#BAE6FD" strokeWidth="1.5" />
              <line x1="78" y1="80" x2="78" y2="114" stroke="#BAE6FD" strokeWidth="1.5" />
              <line x1="104" y1="82" x2="104" y2="114" stroke="#BAE6FD" strokeWidth="1.5" />
            </g>

            {/* 4. ACCUMULATED SQUEEZED TOOTHPASTE SWIRL / MOUND */}
            {/* Dynamically rendered from segments */}
            {segments.length > 0 && (
              <g id="accumulated-toothpaste">
                {segments.map((seg, idx) => {
                  const style = seg.style;
                  const gradId = `paste-seg-grad-${seg.id}`;

                  // Compute horizontal placement along brush head (x from 45 to 118)
                  // Offset by index to spread across the brush bristles
                  const slotIndex = idx % 8;
                  const layer = Math.floor(idx / 8);
                  const posX = 52 + slotIndex * 8.5 + (seg.offsetRatio * 6);
                  const posY = 75 - layer * 9 - Math.sin((slotIndex / 7) * Math.PI) * 7;
                  const dollopWidth = 28 + (idx % 3) * 3;
                  const dollopHeight = 16 + (idx % 2) * 2;

                  return (
                    <g key={seg.id} className="animate-in fade-in zoom-in-75 duration-200">
                      <defs>
                        <linearGradient id={gradId} x1="0%" y1="0%" x2="0%" y2="100%">
                          {style.colors.map((c, cIdx) => (
                            <stop
                              key={cIdx}
                              offset={`${(cIdx / Math.max(1, style.colors.length - 1)) * 100}%`}
                              stopColor={c}
                            />
                          ))}
                        </linearGradient>
                      </defs>

                      {/* Toothpaste Dollop Pill Shape */}
                      <path
                        d={`M ${posX - dollopWidth / 2} ${posY} 
                            C ${posX - dollopWidth / 2} ${posY - dollopHeight / 1.4}, 
                              ${posX + dollopWidth / 2} ${posY - dollopHeight / 1.4}, 
                              ${posX + dollopWidth / 2} ${posY} 
                            C ${posX + dollopWidth / 2} ${posY + dollopHeight / 1.8}, 
                              ${posX - dollopWidth / 2} ${posY + dollopHeight / 1.8}, 
                              ${posX - dollopWidth / 2} ${posY} Z`}
                        fill={`url(#${gradId})`}
                        stroke="#1E293B"
                        strokeWidth="2.5"
                        strokeLinejoin="round"
                      />

                      {/* Striped Bands across dollop if multi-color */}
                      {style.colors.length > 1 &&
                        style.colors.map((c, cIdx) => {
                          const yOffset = (cIdx / style.colors.length - 0.5) * (dollopHeight * 0.7);
                          return (
                            <path
                              key={cIdx}
                              d={`M ${posX - dollopWidth / 2.2} ${posY + yOffset} 
                                  Q ${posX} ${posY + yOffset - 3} 
                                  ${posX + dollopWidth / 2.2} ${posY + yOffset}`}
                              fill="none"
                              stroke={c}
                              strokeWidth={dollopHeight / style.colors.length}
                              strokeLinecap="round"
                              opacity={0.9}
                            />
                          );
                        })}

                      {/* Glossy White Specular Highlight on Dollop */}
                      <path
                        d={`M ${posX - dollopWidth / 3} ${posY - dollopHeight / 4} 
                            Q ${posX} ${posY - dollopHeight / 2.5} 
                            ${posX + dollopWidth / 4} ${posY - dollopHeight / 4}`}
                        fill="none"
                        stroke="#FFFFFF"
                        strokeWidth="3.2"
                        strokeLinecap="round"
                        opacity="0.85"
                      />

                      {/* Cute Sparkle on random dollops */}
                      {style.sparkle && idx % 3 === 0 && (
                        <g transform={`translate(${posX + 6}, ${posY - 6})`}>
                          <path
                            d="M 0 -4 L 1 -1 L 4 0 L 1 1 L 0 4 L -1 1 L -4 0 L -1 -1 Z"
                            fill="#FFFFFF"
                          />
                        </g>
                      )}
                    </g>
                  );
                })}

                {/* Final Curling Toothpaste Tail Peak (Classic toothpaste curl icon) */}
                {segments.length >= 3 && (
                  <g transform="translate(112, 54)">
                    <path
                      d="M -6 10 C -4 0, 6 -8, 14 -4 C 18 -2, 18 4, 14 6 C 10 7, 4 4, 2 10 Z"
                      fill={segments[segments.length - 1].style.colors[0] || '#38BDF8'}
                      stroke="#1E293B"
                      strokeWidth="2.5"
                    />
                    <circle cx="14" cy="-4" r="1.5" fill="#FFFFFF" />
                  </g>
                )}
              </g>
            )}

            {/* Empty Brush Hint when no paste has been squeezed yet */}
            {segments.length === 0 && (
              <g transform="translate(85, 52)">
                <rect x="-42" y="-12" width="84" height="24" rx="12" fill="#FFFFFF" stroke="#94A3B8" strokeWidth="1.5" strokeDasharray="3,3" opacity="0.85" />
                <text x="0" y="4" textAnchor="middle" fill="#64748B" fontSize="11" fontWeight="600" style={{ fontFamily: "'Fredoka', sans-serif" }}>
                  牙刷等待中 🪥
                </text>
              </g>
            )}
          </svg>
        </div>

        {/* Toothpaste Amount Meter & Squeeze Count */}
        <div className="mt-1 flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/80 backdrop-blur-sm border border-slate-200 shadow-xs text-xs sm:text-sm font-semibold text-slate-700">
            <span>挤出牙膏：</span>
            <span className="text-sky-600 font-bold text-sm sm:text-base">{segments.length}</span>
            <span className="text-slate-400 font-normal">坨 (dollops)</span>
          </div>

          {segments.length > 0 && (
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className="flex items-center gap-1 text-xs text-emerald-600 font-bold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
              <span>香甜洁净！</span>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
