'use client';

import { useEffect, useRef, useState } from 'react';

interface CrtBackgroundProps {
  variant?: 'terminal' | 'matrix' | 'code';
  speed?: number;
  typeSpeed?: number;
  motion?: number;
  hue?: number;
  saturation?: number;
  brightness?: number;
  opacity?: number;
  className?: string;
  style?: React.CSSProperties;
}

const terminalLines = [
  'SYSTEM BOOT v2.4.1',
  'INITIALIZING HARDWARE...',
  'CPU: AMD Ryzen 9 7950X @ 4.5GHz',
  'MEM: 64GB DDR5-6000 DETECTED',
  'GPU: NVIDIA RTX 4090 24GB VRAM',
  'STORAGE: 2TB NVMe Gen4',
  'NETWORK: 10GbE FIBER LINK UP',
  '',
  'LOADING KERNEL MODULES...',
  '[  OK  ] memory_manager',
  '[  OK  ] process_scheduler',
  '[  OK  ] filesystem_btrfs',
  '[  OK  ] network_stack',
  '[  OK  ] crypto_engine',
  '[  OK  ] ai_accelerator',
  '',
  'STARTING SERVICES...',
  '[  OK  ] sshd on port 22',
  '[  OK  ] httpd on port 80',
  '[  OK  ] https on port 443',
  '[  OK  ] websocket on port 8080',
  '[  OK  ] database postgresql',
  '[  OK  ] cache redis',
  '[  OK  ] message_queue rabbitmq',
  '[  OK  ] ai_inference_engine',
  '',
  'NEURAL NETWORK INITIALIZATION',
  'LOADING TRANSFORMER MODELS...',
  '[  OK  ] gpt-4-turbo (175B params)',
  '[  OK  ] claude-3-opus (200B params)',
  '[  OK  ] gemini-1.5-pro (1.5M context)',
  '[  OK  ] llama-3-70b (quantized)',
  '[  OK  ] stable-diffusion-xl',
  '[  OK  ] whisper-large-v3',
  '[  OK  ] code-llama-34b',
  '',
  'PIXELTHREAD AI CORE ONLINE',
  'CONNECTING TO DISTRIBUTED COMPUTE...',
  'NODES ACTIVE: 147/150',
  'THROUGHPUT: 2.4M TOKENS/SEC',
  'LATENCY: <12ms P99',
  '',
  'SECURITY AUDIT PASSED',
  'ENCRYPTION: AES-256-GCM + CHACHA20',
  'ZERO-TRUST NETWORK ENABLED',
  'HARDWARE ROOT OF TRUST VERIFIED',
  '',
  '████████████████████████████████',
  'PIXELTHREAD PLATFORM READY',
  '████████████████████████████████',
  '',
  'WAITING FOR USER INPUT...',
  '> _',
];

const matrixChars = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';

export const CrtBackground = ({
  variant = 'terminal',
  speed = 1.0,
  typeSpeed = 1.0,
  motion = 1.0,
  hue = 120,
  saturation = 100,
  brightness = 100,
  opacity = 1.0,
  className = '',
  style,
}: CrtBackgroundProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      const parent = canvas.parentElement;
      if (parent) {
        const rect = parent.getBoundingClientRect();
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = Math.round(rect.width * dpr);
        canvas.height = Math.round(rect.height * dpr);
        setDimensions({ width: rect.width, height: rect.height });
        canvas.style.width = `${rect.width}px`;
        canvas.style.height = `${rect.height}px`;
      }
    };

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let time = 0;
    let lineIndex = 0;
    let charIndex = 0;
    let currentLine = '';
    let typedLines: string[] = [];
    let scrollOffset = 0;
    let scanlineOffset = 0;
    let glitchTime = 0;
    let particles: Array<{ x: number; y: number; vx: number; vy: number; life: number; color: string; size: number }> = [];

    const animate = () => {
      if (!ctx || !canvas) return;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = canvas.width;
      const h = canvas.height;

      time += 0.016 * speed;

      // Clear with dark background
      ctx.fillStyle = `hsla(${hue}, ${saturation}%, ${Math.max(5, brightness - 90)}%, ${opacity * 0.15})`;
      ctx.fillRect(0, 0, w, h);

      // Draw scanlines
      ctx.fillStyle = `hsla(${hue}, ${saturation}%, ${brightness}%, ${opacity * 0.03})`;
      const scanlineSpacing = 4 * dpr;
      scanlineOffset = (scanlineOffset + 0.5 * speed) % scanlineSpacing;
      for (let y = -scanlineSpacing + scanlineOffset; y < h; y += scanlineSpacing) {
        ctx.fillRect(0, y, w, 1 * dpr);
      }

      // Draw vignette
      const gradient = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, Math.max(w, h) / 1.5);
      gradient.addColorStop(0, 'rgba(0,0,0,0)');
      gradient.addColorStop(0.7, `hsla(${hue}, ${saturation}%, 5%, ${opacity * 0.15})`);
      gradient.addColorStop(1, `hsla(${hue}, ${saturation}%, 2%, ${opacity * 0.4})`);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, w, h);

      if (variant === 'terminal') {
        drawTerminal(ctx, w, h, dpr);
      } else if (variant === 'matrix') {
        drawMatrix(ctx, w, h, dpr);
      } else if (variant === 'code') {
        drawCode(ctx, w, h, dpr);
      }

      // Draw particles
      drawParticles(ctx, w, h, dpr);

      // Draw glitch effect occasionally
      if (Math.random() < 0.001 * speed) {
        glitchTime = 0.1;
      }
      if (glitchTime > 0) {
        drawGlitch(ctx, w, h, dpr);
        glitchTime -= 0.016;
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    const drawTerminal = (ctx: CanvasRenderingContext2D, w: number, h: number, dpr: number) => {
      const fontSize = Math.max(12, Math.min(16, w / 80)) * dpr;
      const lineHeight = fontSize * 1.4;
      const padding = 40 * dpr;
      const maxLines = Math.floor((h - padding * 2) / lineHeight);

      ctx.font = `${fontSize}px 'JetBrains Mono', 'Fira Code', 'Consolas', monospace`;
      ctx.textBaseline = 'top';

      // Typewriter effect
      if (typedLines.length < terminalLines.length) {
        if (charIndex === 0 && lineIndex < terminalLines.length) {
          currentLine = terminalLines[lineIndex];
        }

        if (charIndex < currentLine.length) {
          charIndex += 0.5 * typeSpeed;
          if (charIndex >= currentLine.length) {
            typedLines.push(currentLine.substring(0, Math.floor(charIndex)));
            lineIndex++;
            charIndex = 0;
            if (typedLines.length > maxLines) {
              scrollOffset += lineHeight;
            }
          }
        }
      }

      // Draw typed lines
      typedLines.forEach((line, i) => {
        const y = padding + i * lineHeight - scrollOffset;
        if (y + lineHeight < padding || y > h - padding) return;

        // Check for special lines
        const isHeader = line.startsWith('█');
        const isPrompt = line.startsWith('>');
        const isSuccess = line.includes('[  OK  ]');
        const isInfo = line.startsWith('[') && !isSuccess;

        if (isHeader) {
          ctx.fillStyle = `hsla(${hue}, ${saturation}%, ${brightness}%, ${opacity})`;
        } else if (isPrompt) {
          ctx.fillStyle = `hsla(${hue}, ${saturation}%, ${brightness}%, ${opacity})`;
          // Blinking cursor
          if (Math.floor(time * 2) % 2 === 0) {
            ctx.fillText(line + '█', padding, y);
            return;
          }
        } else if (isSuccess) {
          ctx.fillStyle = `hsla(${hue}, ${saturation}%, ${brightness}%, ${opacity * 0.8})`;
        } else if (isInfo) {
          ctx.fillStyle = `hsla(${(hue + 60) % 360}, ${saturation}%, ${brightness}%, ${opacity * 0.7})`;
        } else {
          ctx.fillStyle = `hsla(${hue}, ${saturation * 0.5}%, ${brightness * 0.8}%, ${opacity * 0.6})`;
        }

        ctx.fillText(line, padding, y);
      });

      // Draw cursor on last line if still typing
      if (lineIndex < terminalLines.length && charIndex > 0 && charIndex < currentLine.length) {
        const y = padding + (typedLines.length) * lineHeight - scrollOffset;
        const partial = currentLine.substring(0, Math.floor(charIndex));
        ctx.fillStyle = `hsla(${hue}, ${saturation}%, ${brightness}%, ${opacity})`;
        ctx.fillText(partial, padding, y);
        if (Math.floor(time * 3) % 2 === 0) {
          const metrics = ctx.measureText(partial);
          ctx.fillRect(padding + metrics.width, y, 2 * dpr, fontSize * 0.8);
        }
      }
    };

    const drawMatrix = (ctx: CanvasRenderingContext2D, w: number, h: number, dpr: number) => {
      const fontSize = 14 * dpr;
      const columns = Math.floor(w / fontSize);
      const drops: number[] = [];

      // Initialize drops
      for (let i = 0; i < columns; i++) {
        drops[i] = Math.random() * h;
      }

      ctx.font = `${fontSize}px 'JetBrains Mono', monospace`;

      // Semi-transparent black for trail effect
      ctx.fillStyle = `rgba(0, 0, 0, ${0.05 * opacity})`;
      ctx.fillRect(0, 0, w, h);

      for (let i = 0; i < columns; i++) {
        const char = matrixChars[Math.floor(Math.random() * matrixChars.length)];
        const x = i * fontSize;
        const y = drops[i];

        // Color based on position
        const brightness_var = 0.3 + Math.random() * 0.7;
        ctx.fillStyle = `hsla(${hue}, ${saturation}%, ${brightness * brightness_var}%, ${opacity})`;
        ctx.fillText(char, x, y);

        if (y > h && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i] += fontSize * (0.5 + Math.random() * 0.5) * speed;
      }
    };

    const drawCode = (ctx: CanvasRenderingContext2D, w: number, h: number, dpr: number) => {
      const codeSnippets = [
        'const neuralNet = new Transformer({',
        '  layers: 96,',
        '  heads: 96,',
        '  dim: 12288,',
        '  vocab: 50257',
        '});',
        '',
        'async function generate(prompt) {',
        '  const tokens = tokenizer.encode(prompt);',
        '  const output = await model.forward(tokens);',
        '  return tokenizer.decode(output);',
        '}',
        '',
        'const result = await generate(',
        '  "Write a blog post about AI"',
        ');',
        '',
        'console.log(result);',
        '// "Artificial Intelligence is..."',
      ];

      const fontSize = Math.max(11, Math.min(14, w / 100)) * dpr;
      const lineHeight = fontSize * 1.5;
      const padding = 40 * dpr;

      ctx.font = `${fontSize}px 'JetBrains Mono', 'Fira Code', monospace`;
      ctx.textBaseline = 'top';

      codeSnippets.forEach((line, i) => {
        const y = padding + i * lineHeight + Math.sin(time * 0.5 + i * 0.3) * 2 * dpr;
        if (y < -lineHeight || y > h) return;

        // Syntax highlighting colors
        let color = `hsla(${hue}, ${saturation}%, ${brightness * 0.7}%, ${opacity * 0.6})`;
        if (line.startsWith('const') || line.startsWith('async') || line.startsWith('function') || line.startsWith('return')) {
          color = `hsla(${(hue + 270) % 360}, ${saturation}%, ${brightness}%, ${opacity})`;
        } else if (line.includes('//')) {
          color = `hsla(${(hue + 60) % 360}, ${saturation * 0.5}%, ${brightness * 0.6}%, ${opacity * 0.5})`;
        } else if (line.includes('{') || line.includes('}') || line.includes('(') || line.includes(')')) {
          color = `hsla(${(hue + 30) % 360}, ${saturation}%, ${brightness * 0.9}%, ${opacity * 0.8})`;
        } else if (/['"`]/.test(line)) {
          color = `hsla(${(hue + 120) % 360}, ${saturation}%, ${brightness}%, ${opacity * 0.8})`;
        } else if (/^\s*\d/.test(line.trim())) {
          color = `hsla(${(hue + 30) % 360}, ${saturation}%, ${brightness}%, ${opacity * 0.8})`;
        }

        ctx.fillStyle = color;
        ctx.fillText(line, padding + Math.sin(time + i) * 1 * dpr, y);
      });
    };

    const drawParticles = (ctx: CanvasRenderingContext2D, w: number, h: number, dpr: number) => {
      // Spawn particles
      if (Math.random() < 0.02 * speed) {
        particles.push({
          x: Math.random() * w,
          y: h,
          vx: (Math.random() - 0.5) * 20 * dpr * speed,
          vy: -(Math.random() * 50 + 20) * dpr * speed,
          life: 1,
          color: `hsla(${hue + (Math.random() - 0.5) * 60}, ${saturation}%, ${brightness}%, ${opacity})`,
          size: (Math.random() * 2 + 1) * dpr,
        });
      }

      // Update and draw particles
      particles = particles.filter((p) => {
        p.x += p.vx * 0.016;
        p.y += p.vy * 0.016;
        p.vy += 100 * dpr * 0.016; // gravity
        p.life -= 0.01;

        if (p.life <= 0) return false;

        ctx.globalAlpha = p.life * opacity;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;

        return true;
      });
    };

    const drawGlitch = (ctx: CanvasRenderingContext2D, w: number, h: number, dpr: number) => {
      const slices = 3 + Math.floor(Math.random() * 5);
      for (let i = 0; i < slices; i++) {
        const y = Math.random() * h;
        const height = Math.random() * 20 * dpr + 5 * dpr;
        const offset = (Math.random() - 0.5) * 30 * dpr;

        ctx.drawImage(
          canvas,
          0, y, w, height,
          offset, y, w, height
        );
      }
    };

    resize();
    window.addEventListener('resize', resize);
    animate();

    return () => {
      window.removeEventListener('resize', resize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [variant, speed, typeSpeed, motion, hue, saturation, brightness, opacity]);

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 w-full h-full pointer-events-none ${className}`}
      style={{
        ...style,
        zIndex: -1,
      }}
      aria-hidden="true"
    />
  );
};