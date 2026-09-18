import { useState, useEffect } from 'react';

interface Bubble {
  id: number;
  x: number;
  size: number;
  speed: number;
  color: string;
}

export function FloatingBubbles() {
  const [bubbles, setBubbles] = useState<Bubble[]>([]);

  useEffect(() => {
    // Generate gentle ambient bubbles
    const initialBubbles: Bubble[] = Array.from({ length: 14 }).map((_, i) => ({
      id: i,
      x: Math.random() * 90 + 5,
      size: Math.random() * 28 + 18,
      speed: Math.random() * 12 + 10,
      color: ['rgba(255,255,255,0.6)', 'rgba(214,245,255,0.6)', 'rgba(255,225,240,0.5)', 'rgba(220,255,235,0.5)'][i % 4],
    }));
    setBubbles(initialBubbles);
  }, []);

  const popBubble = (id: number) => {
    setBubbles((prev) =>
      prev.map((b) =>
        b.id === id
          ? {
              ...b,
              x: Math.random() * 90 + 5,
              size: Math.random() * 28 + 18,
              speed: Math.random() * 12 + 10,
            }
          : b
      )
    );
  };

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0">
      {bubbles.map((b) => (
        <div
          key={b.id}
          onClick={() => popBubble(b.id)}
          className="absolute rounded-full border border-white/60 shadow-sm pointer-events-auto cursor-pointer transition-transform hover:scale-125 active:scale-75"
          style={{
            left: `${b.x}%`,
            bottom: '-40px',
            width: `${b.size}px`,
            height: `${b.size}px`,
            backgroundColor: b.color,
            backdropFilter: 'blur(2px)',
            animation: `floatBubble ${b.speed}s linear infinite`,
            animationDelay: `${b.id * 0.7}s`,
          }}
        >
          {/* Bubble reflection highlight */}
          <div className="absolute top-1 left-1.5 w-2 h-2 rounded-full bg-white/80" />
        </div>
      ))}

      <style>{`
        @keyframes floatBubble {
          0% {
            transform: translateY(0) translateX(0) scale(0.9);
            opacity: 0;
          }
          10% {
            opacity: 0.8;
          }
          90% {
            opacity: 0.7;
          }
          100% {
            transform: translateY(-110vh) translateX(${Math.sin(Date.now()) * 30}px) scale(1.1);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
