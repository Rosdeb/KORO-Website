"use client";

import { useEffect, useRef } from "react";

const SCRIPT_CHARS = [
  // Bengali
  "ক", "খ", "গ", "ঘ", "ঙ", "চ", "ছ", "জ", "ঝ",
  "আ", "ই", "উ", "এ", "ও", "অ", "ঞ", "ণ", "ন", "ম", "ব",
  // Myanmar
  "က", "ခ", "ဂ", "ဃ", "င", "ဆ", "ဇ", "ဈ", "ဉ",
  "ဣ", "ဤ", "ဥ", "ဦ", "ဧ", "ဩ", "ဪ", "ာ", "ိ",
  // Chakma
  "𑄃", "𑄄", "𑄅", "𑄆", "𑄇", "𑄈", "𑄉", "𑄊",
  "𑄋", "𑄌", "𑄍", "𑄎", "𑄏", "𑄐", "𑄑", "𑄒",
];

interface Particle {
  x: number;
  y: number;
  char: string;
  size: number;
  speed: number;
  alpha: number;
  targetAlpha: number;
  drift: number;
  accent: boolean;
  fadeDir: number;   // 1 = fading in, -1 = fading out
  fadeDelay: number; // frames to wait before starting fade
  glowRadius: number;
}

function makeParticle(canvasW: number, canvasH: number, fromBottom = false): Particle {
  const size = 11 + Math.random() * 26; // wider size range = more depth
  const isAccent = Math.random() < 0.12;
  return {
    x: Math.random() * canvasW,
    y: fromBottom ? canvasH + size + Math.random() * 80 : Math.random() * canvasH,
    char: SCRIPT_CHARS[Math.floor(Math.random() * SCRIPT_CHARS.length)],
    size,
    speed: 0.2 + Math.random() * 0.55,
    alpha: 0,
    targetAlpha: isAccent
      ? 0.18 + Math.random() * 0.22   // accent chars are brighter
      : 0.04 + Math.random() * 0.07,
    drift: (Math.random() - 0.5) * 0.3,
    accent: isAccent,
    fadeDir: 1,
    fadeDelay: Math.floor(Math.random() * 180),
    glowRadius: isAccent ? size * 1.6 : 0,
  };
}

interface ScriptRainProps {
  dark?: boolean;
}

export function ScriptRain({ dark }: ScriptRainProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf: number;
    let frame = 0;
    let particles: Particle[] = [];

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = canvas.offsetWidth * dpr;
      canvas.height = canvas.offsetHeight * dpr;
      ctx.scale(dpr, dpr);
    };

    const w = () => canvas.offsetWidth;
    const h = () => canvas.offsetHeight;

    const init = () => {
      particles = Array.from({ length: 65 }, () => makeParticle(w(), h()));
    };

    const isDark = () =>
      dark !== undefined ? dark : document.documentElement.classList.contains("dark");

    const draw = () => {
      frame++;
      ctx.clearRect(0, 0, w(), h());

      const darkMode = isDark();
      const fgColor = darkMode ? "rgba(250,250,249,1)" : "rgba(28,25,23,1)";
      const accentColor = darkMode ? "#34d399" : "#2a835f";

      for (const p of particles) {
        // Respect fade delay before starting
        if (p.fadeDelay > 0) {
          p.fadeDelay--;
          continue;
        }

        // Smooth alpha breathing for accent chars
        if (p.accent) {
          p.alpha += p.fadeDir * 0.004;
          if (p.alpha >= p.targetAlpha) { p.alpha = p.targetAlpha; p.fadeDir = -1; }
          if (p.alpha <= p.targetAlpha * 0.3) { p.alpha = p.targetAlpha * 0.3; p.fadeDir = 1; }
        } else {
          if (p.alpha < p.targetAlpha) p.alpha = Math.min(p.alpha + 0.0015, p.targetAlpha);
        }

        ctx.save();

        // Soft glow behind accent characters
        if (p.accent && p.alpha > 0.05) {
          const grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.glowRadius);
          grd.addColorStop(0, darkMode ? `rgba(52,211,153,${p.alpha * 0.35})` : `rgba(42,131,95,${p.alpha * 0.3})`);
          grd.addColorStop(1, "rgba(0,0,0,0)");
          ctx.fillStyle = grd;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.glowRadius, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.globalAlpha = p.alpha;
        ctx.font = `${p.size}px serif`;
        ctx.fillStyle = p.accent ? accentColor : fgColor;
        ctx.fillText(p.char, p.x, p.y);
        ctx.restore();

        p.y -= p.speed;
        p.x += p.drift;

        if (p.y < -p.size * 3) {
          Object.assign(p, makeParticle(w(), h(), true));
        }
        if (p.x < -p.size * 2) p.x = w() + p.size;
        if (p.x > w() + p.size * 2) p.x = -p.size;
      }

      raf = requestAnimationFrame(draw);
    };

    resize();
    init();
    draw();

    const handleResize = () => { resize(); init(); };
    window.addEventListener("resize", handleResize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", handleResize);
    };
  }, [dark]);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 h-full w-full"
      aria-hidden="true"
    />
  );
}
