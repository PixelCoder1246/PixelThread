'use client';

import { useEffect, useState } from 'react';

interface Particle {
  width: number;
  height: number;
  top: number;
  left: number;
  animationDelay: number;
  animationDuration: number;
}

export function FloatingParticles({ count = 15 }: { count?: number }) {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const newParticles: Particle[] = [];
    for (let i = 0; i < 15; i++) {
      newParticles.push({
        width: Math.random() * 6 + 3,
        height: Math.random() * 6 + 3,
        top: Math.random() * 100,
        left: Math.random() * 100,
        animationDelay: Math.random() * 8,
        animationDuration: 15 + Math.random() * 10,
      });
    }
    setParticles(newParticles);
  }, []);

  if (!mounted) {
    return (
      <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white/5 animate-float"
            style={{
              width: '4px',
              height: '4px',
              top: '50%',
              left: '50%',
              animationDelay: '0s',
              animationDuration: '20s',
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
      {particles.map((p, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-white/5 animate-float"
          style={{
            width: `${p.width}px`,
            height: `${p.height}px`,
            top: `${p.top}%`,
            left: `${p.left}%`,
            animationDelay: `${p.animationDelay}s`,
            animationDuration: `${p.animationDuration}s`,
          }}
        />
      ))}
    </div>
  );
}
