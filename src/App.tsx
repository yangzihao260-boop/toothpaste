/**
 * Toothpaste Learning Game
 * Designed for primary school English teachers and children
 * Target Word: TOOTHPASTE (Pronunciation: /ˈtuːθpeɪst/, Spelling: T-O-O-T-H-P-A-S-T-E)
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import {
  Volume2,
  VolumeX,
  Music,
  RotateCcw,
  Sparkles,
  Maximize2,
  Minimize2,
  Palette,
  HelpCircle,
} from 'lucide-react';
import confetti from 'canvas-confetti';

import { ToothpasteStyle, PasteSegment } from './types';
import { PRESET_TOOTHPASTE_STYLES, getRandomToothpasteStyle } from './utils/colorStyles';
import { soundCtrl } from './utils/audio';

import { ToothpasteTube } from './components/ToothpasteTube';
import { ToothbrushWithPaste } from './components/ToothbrushWithPaste';
import { SpellingBar } from './components/SpellingBar';
import { FloatingBubbles } from './components/FloatingBubbles';

export default function App() {
  // Game State
  const [currentStyle, setCurrentStyle] = useState<ToothpasteStyle>(PRESET_TOOTHPASTE_STYLES[0]);
  const [segments, setSegments] = useState<PasteSegment[]>([]);
  const [isSqueezing, setIsSqueezing] = useState(false);
  const [squeezeCount, setSqueezeCount] = useState(0);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // Audio settings state
  const [bgmEnabled, setBgmEnabled] = useState(true);
  const [sfxEnabled, setSfxEnabled] = useState(true);
  const [speechEnabled, setSpeechEnabled] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showStyleMenu, setShowStyleMenu] = useState(false);
  const [showTeacherGuide, setShowTeacherGuide] = useState(false);

  // Refs for continuous squeezing
  const squeezeIntervalRef = useRef<number | null>(null);
  const pointerStartPos = useRef<{ x: number; y: number } | null>(null);
  const audioStartedRef = useRef(false);

  // Start BGM on first user interaction per browser policy
  const ensureAudioInit = useCallback(() => {
    if (!audioStartedRef.current) {
      audioStartedRef.current = true;
      if (bgmEnabled) {
        soundCtrl.startBGM();
      }
    }
  }, [bgmEnabled]);

  // Clean pronunciation handler (strictly "toothpaste")
  const handlePronounce = useCallback(() => {
    ensureAudioInit();
    soundCtrl.speakToothpaste(true);
  }, [ensureAudioInit]);

  // Add dollop segment to toothbrush
  const addPasteDollop = useCallback((style: ToothpasteStyle, offset = 0) => {
    const newSegment: PasteSegment = {
      id: `paste-${Date.now()}-${Math.random()}`,
      x: 0,
      y: 0,
      width: 32,
      height: 20,
      style: { ...style },
      offsetRatio: offset,
      createdAt: Date.now(),
    };

    setSegments((prev) => {
      // Limit to 28 dollops max to keep toothbrush full & neat without overcrowding
      const updated = prev.length >= 28 ? [...prev.slice(1), newSegment] : [...prev, newSegment];
      return updated;
    });

    setSqueezeCount((prev) => {
      const next = prev + 1;
      // When reaching letter 10 or completing the word
      if (next % 10 === 0) {
        soundCtrl.playSparkleSuccess();
        confetti({
          particleCount: 60,
          spread: 80,
          origin: { y: 0.6 },
          colors: style.colors,
        });
      }
      return next;
    });
  }, []);

  // Squeeze Start (Click or Long-Press start)
  const handleSqueezeStart = (e: React.PointerEvent) => {
    ensureAudioInit();
    (e.target as HTMLElement)?.setPointerCapture?.(e.pointerId);

    pointerStartPos.current = { x: e.clientX, y: e.clientY };
    setIsSqueezing(true);

    // Pick a new random style for this squeeze sequence per requirement!
    const newStyle = getRandomToothpasteStyle(currentStyle.id);
    setCurrentStyle(newStyle);

    // Sound effects
    soundCtrl.playSqueezePop();
    soundCtrl.startContinuousExtrusion();

    // STRICT: English pronunciation of "toothpaste" upon squeeze
    soundCtrl.speakToothpaste();

    // Add first dollop
    addPasteDollop(newStyle, 0);

    // Continuous extrusion interval while holding down / dragging
    if (squeezeIntervalRef.current) {
      clearInterval(squeezeIntervalRef.current);
    }

    squeezeIntervalRef.current = window.setInterval(() => {
      soundCtrl.playSqueezePop();
      addPasteDollop(newStyle, (Math.random() - 0.5) * 1.5);
    }, 240);
  };

  // Squeeze Drag (Tracking pointer movement while pressed)
  const handleSqueezeMove = (e: React.PointerEvent) => {
    if (!isSqueezing || !pointerStartPos.current) return;

    const dx = e.clientX - pointerStartPos.current.x;
    const dy = e.clientY - pointerStartPos.current.y;

    // Limit drag sway
    const clampedX = Math.max(-50, Math.min(50, dx * 0.4));
    const clampedY = Math.max(-20, Math.min(60, dy * 0.4));
    setDragOffset({ x: clampedX, y: clampedY });

    const dragSpeed = Math.sqrt(dx * dx + dy * dy);
    soundCtrl.updateContinuousExtrusion(dragSpeed / 50);
  };

  // Squeeze End (Pointer release or leave)
  const handleSqueezeEnd = () => {
    if (!isSqueezing) return;
    setIsSqueezing(false);
    pointerStartPos.current = null;
    setDragOffset({ x: 0, y: 0 });

    soundCtrl.stopContinuousExtrusion();

    if (squeezeIntervalRef.current) {
      clearInterval(squeezeIntervalRef.current);
      squeezeIntervalRef.current = null;
    }
  };

  // Wash / Reset Toothbrush
  const handleResetBrush = () => {
    ensureAudioInit();
    soundCtrl.playWashSound();
    setSegments([]);
  };

  // Reset Everything (Game restart)
  const handleFullReset = () => {
    ensureAudioInit();
    soundCtrl.playWashSound();
    setSegments([]);
    setSqueezeCount(0);
    const newStyle = getRandomToothpasteStyle();
    setCurrentStyle(newStyle);
  };

  // Toggle BGM
  const handleToggleBgm = () => {
    ensureAudioInit();
    const next = soundCtrl.toggleBGM();
    setBgmEnabled(next);
  };

  // Toggle SFX
  const handleToggleSfx = () => {
    ensureAudioInit();
    soundCtrl.sfxEnabled = !sfxEnabled;
    setSfxEnabled(soundCtrl.sfxEnabled);
  };

  // Toggle Speech
  const handleToggleSpeech = () => {
    ensureAudioInit();
    soundCtrl.speechEnabled = !speechEnabled;
    setSpeechEnabled(soundCtrl.speechEnabled);
  };

  // Fullscreen toggle for classroom smartboards
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (squeezeIntervalRef.current) {
        clearInterval(squeezeIntervalRef.current);
      }
      soundCtrl.stopBGM();
      soundCtrl.stopContinuousExtrusion();
    };
  }, []);

  return (
    <div className="relative min-h-screen w-full bg-gradient-to-b from-sky-50 via-teal-50/40 to-indigo-50 flex flex-col items-center justify-between p-3 sm:p-5 overflow-x-hidden">
      {/* Floating Bubbles Interactive Background */}
      <FloatingBubbles />

      {/* Top Classroom Navigation Bar */}
      <header className="relative z-10 w-full max-w-5xl flex flex-wrap items-center justify-between gap-3 px-3 py-2 sm:py-2.5 rounded-2xl bg-white/80 backdrop-blur-md border border-slate-200/80 shadow-xs">
        {/* App Title & Phonics Tag */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-sky-400 to-teal-300 flex items-center justify-center text-xl shadow-xs">
            🪥
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base sm:text-lg text-slate-800 tracking-tight">
                Toothpaste Fun
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 font-bold">
                小学英语单词互动
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-500 hidden sm:block">
              带孩子们趣味学习 <span className="font-semibold text-slate-700">toothpaste</span> 的拼写与标准发音
            </p>
          </div>
        </div>

        {/* Classroom Controls: BGM, SFX, Speech, Fullscreen, Guide */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* BGM Toggle */}
          <button
            onClick={handleToggleBgm}
            id="toggle-bgm-btn"
            className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
              bgmEnabled
                ? 'bg-amber-100 text-amber-900 hover:bg-amber-200'
                : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
            }`}
            title={bgmEnabled ? '背景音乐：开启 (Click to mute BGM)' : '背景音乐：静音 (Click to play BGM)'}
          >
            <Music className="w-4 h-4" />
            <span className="hidden md:inline">{bgmEnabled ? '音乐开' : '音乐关'}</span>
          </button>

          {/* Squeeze SFX Toggle */}
          <button
            onClick={handleToggleSfx}
            id="toggle-sfx-btn"
            className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
              sfxEnabled
                ? 'bg-sky-100 text-sky-900 hover:bg-sky-200'
                : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
            }`}
            title={sfxEnabled ? '挤压音效：开启' : '挤压音效：静音'}
          >
            {sfxEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            <span className="hidden md:inline">{sfxEnabled ? '音效开' : '音效关'}</span>
          </button>

          {/* Color Flavors Selector Toggle */}
          <button
            onClick={() => setShowStyleMenu(!showStyleMenu)}
            id="toggle-palette-btn"
            className="p-2 rounded-xl bg-purple-100 text-purple-900 hover:bg-purple-200 text-xs font-semibold flex items-center gap-1 cursor-pointer"
            title="查看所有牙膏条纹和颜色款式"
          >
            <Palette className="w-4 h-4 text-purple-600" />
            <span className="hidden md:inline">牙膏款式</span>
          </button>

          {/* Classroom Guide modal button */}
          <button
            onClick={() => setShowTeacherGuide(true)}
            id="teacher-guide-btn"
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1 cursor-pointer"
            title="教学指南与游戏规则"
          >
            <HelpCircle className="w-4 h-4 text-slate-600" />
            <span className="hidden md:inline">教学指南</span>
          </button>

          {/* Fullscreen Button */}
          <button
            onClick={toggleFullscreen}
            id="toggle-fullscreen-btn"
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
            title="全屏模式 (适合投影仪与电子白板)"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Optional Preset Styles Dropdown Picker */}
      {showStyleMenu && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-30 w-full max-w-4xl p-3 sm:p-4 my-2 rounded-2xl bg-white/95 backdrop-blur-md shadow-lg border border-purple-200"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs sm:text-sm font-bold text-purple-900 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-500" />
              丰富牙膏条纹与多彩口味库 (每次挤压也会自动随机变换哦)：
            </span>
            <button
              onClick={() => setShowStyleMenu(false)}
              className="text-xs font-bold text-slate-400 hover:text-slate-700 px-2 py-0.5"
            >
              收起 ✕
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {PRESET_TOOTHPASTE_STYLES.map((st) => (
              <button
                key={st.id}
                onClick={() => {
                  setCurrentStyle(st);
                  setShowStyleMenu(false);
                }}
                className={`p-2 rounded-xl border text-left flex items-center gap-2 transition-all cursor-pointer ${
                  currentStyle.id === st.id
                    ? 'border-purple-500 bg-purple-50 shadow-xs'
                    : 'border-slate-200 hover:border-purple-300 hover:bg-slate-50'
                }`}
              >
                <div
                  className="w-5 h-5 rounded-full shadow-inner flex-shrink-0"
                  style={{
                    background:
                      st.colors.length > 1
                        ? `linear-gradient(135deg, ${st.colors.join(', ')})`
                        : st.colors[0],
                  }}
                />
                <div className="overflow-hidden">
                  <div className="text-xs font-bold text-slate-800 truncate">{st.nameZh}</div>
                  <div className="text-[10px] text-slate-500 truncate">{st.name}</div>
                </div>
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Main Learning & Gaming Stage */}
      <main className="relative z-10 w-full max-w-4xl flex flex-col items-center justify-center flex-1 my-2">
        {/* 1. Educational Phonics & Spelling Bar */}
        <SpellingBar squeezeCount={squeezeCount} onPronounce={handlePronounce} />

        {/* 2. Interactive Squeeze Stage (Toothpaste Tube above, Toothbrush below) */}
        <div className="relative w-full flex flex-col items-center justify-center mt-2 sm:mt-3">
          {/* Toothpaste Tube (Upper) */}
          <ToothpasteTube
            isSqueezing={isSqueezing}
            onSqueezeStart={handleSqueezeStart}
            onSqueezeMove={handleSqueezeMove}
            onSqueezeEnd={handleSqueezeEnd}
            currentStyle={currentStyle}
            squeezeProgress={Math.min(1, squeezeCount / 10)}
          />

          {/* Toothbrush & Paste Extrusion (Lower) */}
          <ToothbrushWithPaste
            isSqueezing={isSqueezing}
            currentStyle={currentStyle}
            segments={segments}
            extrusionStreamProgress={isSqueezing ? 1 : 0}
            dragOffset={dragOffset}
            onResetBrush={handleResetBrush}
          />
        </div>
      </main>

      {/* Bottom Footer & Classroom Tips */}
      <footer className="relative z-10 w-full max-w-4xl flex flex-wrap items-center justify-between gap-2 px-4 py-2 rounded-xl bg-white/70 backdrop-blur-xs border border-slate-200/60 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <span>💡 游戏技巧：长按牙膏拖动可以连续挤出彩色波浪条纹！</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleFullReset}
            id="full-reset-btn"
            className="flex items-center gap-1 text-slate-600 hover:text-rose-600 font-semibold cursor-pointer transition-colors"
            title="重置全部字母和牙膏状态"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>重新开始 (Restart)</span>
          </button>
        </div>
      </footer>

      {/* Teacher Guide Modal */}
      {showTeacherGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl border border-slate-100 flex flex-col gap-4 text-slate-700"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">👩‍🏫</span>
                <h2 className="text-lg font-bold text-slate-900">英语课堂教学设计说明</h2>
              </div>
              <button
                onClick={() => setShowTeacherGuide(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 font-bold flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs sm:text-sm leading-relaxed">
              <div className="p-3 bg-sky-50 rounded-2xl border border-sky-100">
                <div className="font-bold text-sky-900 mb-1">🎯 核心教学目标：</div>
                <p>
                  掌握英语单词 <strong className="text-sky-700">toothpaste</strong> 的构词法（合成词：
                  <span className="text-teal-700 font-bold">tooth</span> + <span className="text-indigo-700 font-bold">paste</span>）、精准自然拼读发音与 10 个字母拼写顺序。
                </p>
              </div>

              <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-100">
                <div className="font-bold text-emerald-900 mb-1">🎮 游戏互动规则：</div>
                <ul className="list-disc list-inside space-y-1 text-emerald-800">
                  <li><strong>点击或长按拖动</strong>：按住大牙膏，牙膏会咕嘟咕嘟挤出到下方的牙刷毛上。</li>
                  <li><strong>随机条纹与多彩色彩</strong>：每次挤出的牙膏都有不同惊喜颜色（三色条纹、七彩虹、泡泡糖粉蓝、西瓜绿红条纹等）。</li>
                  <li><strong>专注单一单词发音</strong>：遵循教学原则，每次挤压均伴随纯正的 <em>toothpaste</em> 英文发音，无其他干扰杂音。</li>
                  <li><strong>字母收集进度</strong>：每次挤牙膏点亮上方一个字母，10 个字母集齐触发庆祝礼花！</li>
                </ul>
              </div>
            </div>

            <button
              onClick={() => setShowTeacherGuide(false)}
              className="w-full py-2.5 rounded-2xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-sm shadow-md transition-transform active:scale-95 cursor-pointer mt-1"
            >
              我知道啦，开始上课！ (Let's Play!)
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
}
