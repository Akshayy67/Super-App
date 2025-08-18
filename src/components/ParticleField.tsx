import React, { useRef, useEffect } from "react";

/**
 * Subtle particle field: soft glowing dots drifting slowly.
 * Lightweight (no three.js) and respects prefers-reduced-motion.
 */
export const ParticleField: React.FC<{
  className?: string;
  /** Desired baseline particle count on ~1280x720 viewport */
  baseCount?: number;
  /** Draw faint lines between nearby particles */
  connectLines?: boolean;
  /** Max distance in px for connecting lines */
  lineDistance?: number;
  /** Speed multiplier for particle movement (1 = default) */
  speedFactor?: number;
  /** Base particle color (hex or rgb) */
  particleColor?: string;
  /** Outer glow color */
  glowColor?: string;
  /** Line (edge) color */
  lineColor?: string;
  /** Multiplier for particle size (1 = default) */
  sizeFactor?: number;
  /** Brightness/alpha multiplier */
  brightness?: number;
  /** Line width multiplier */
  lineWidthFactor?: number;
  /** Maximum multiplier applied after area scaling */
  maxMultiplier?: number;
  /** Max particle count for exhaustive pair line drawing before switching to sampling */
  maxLineParticles?: number;
  /** Target maximum number of lines per frame (sampling budget) */
  targetLines?: number;
}> = ({
  className = "",
  baseCount = 120,
  connectLines = true,
  lineDistance = 140,
  speedFactor = 1,
  particleColor = "#60a5fa", // light blue (tailwind blue-400)
  glowColor = "#93c5fd", // lighter glow (blue-300)
  lineColor = "#3b82f6", // edge (blue-500)
  sizeFactor = 1,
  brightness = 1,
  lineWidthFactor = 1,
  maxMultiplier = 3,
  maxLineParticles = 450,
  targetLines = 1400,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const lastTimeRef = useRef<number>(0);
  const reducedMotion = useRef<boolean>(false);
  const mouseRef = useRef<{ x: number; y: number; active: boolean }>({
    x: 0,
    y: 0,
    active: false,
  });

  interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    radius: number;
    baseRadius: number;
    glow: number; // phase for pulsing effect
  }

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    reducedMotion.current = media.matches;
    const listener = () => (reducedMotion.current = media.matches);
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Helper to convert color + alpha into rgba()
    const toRGBA = (hexOrRgb: string, alpha: number) => {
      if (hexOrRgb.startsWith("#")) {
        let hex = hexOrRgb.slice(1);
        if (hex.length === 3)
          hex = hex
            .split("")
            .map((c) => c + c)
            .join("");
        const num = parseInt(hex, 16);
        const r = (num >> 16) & 255;
        const g = (num >> 8) & 255;
        const b = num & 255;
        return `rgba(${r},${g},${b},${alpha})`;
      }
      if (hexOrRgb.startsWith("rgb")) {
        return hexOrRgb.replace(/rgba?\(([^)]+)\)/, (_m, inner) => {
          const parts = inner
            .split(",")
            .map((p: string) => p.trim())
            .slice(0, 3);
          return `rgba(${parts.join(",")},${alpha})`;
        });
      }
      return hexOrRgb; // fallback
    };

    const renderParticle = (ctx: CanvasRenderingContext2D, p: Particle) => {
      const intensity = 0.5 + 0.5 * Math.sin(p.glow);
      let alpha = (0.45 + 0.65 * intensity) * brightness;
      if (alpha > 1) alpha = 1;
      const r = p.radius * sizeFactor;
      ctx.beginPath();
      ctx.fillStyle = toRGBA(particleColor, alpha);
      ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
      ctx.fill();
      const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r * 4.5);
      gradient.addColorStop(0, toRGBA(glowColor, Math.min(alpha * 0.55, 1)));
      gradient.addColorStop(1, toRGBA(glowColor, 0));
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(p.x, p.y, r * 4.5, 0, Math.PI * 2);
      ctx.fill();
    };

    const calcCount = () => {
      const area = canvas.clientWidth * canvas.clientHeight;
      const reference = 1280 * 720;
      const scaled = Math.round((baseCount * area) / reference);
      return Math.min(scaled, Math.round(baseCount * maxMultiplier));
    };

    const initParticles = () => {
      const count = calcCount();
      particlesRef.current = Array.from({ length: count }, () => {
        const speed = 0.04 + Math.random() * 0.12;
        const dir = Math.random() * Math.PI * 2;
        const radius = 1.6 + Math.random() * 2.8;
        return {
          x: Math.random() * canvas.clientWidth,
          y: Math.random() * canvas.clientHeight,
          vx: Math.cos(dir) * speed,
          vy: Math.sin(dir) * speed,
          radius,
          baseRadius: radius,
          glow: Math.random() * Math.PI * 2,
        } as Particle;
      });
    };

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = canvas.clientWidth * dpr;
      canvas.height = canvas.clientHeight * dpr;
      ctx.setTransform(1, 0, 0, 1, 0, 0); // reset
      ctx.scale(dpr, dpr);
      initParticles();
    };

    const draw = (now: number) => {
      if (reducedMotion.current) {
        ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
        particlesRef.current.forEach((p) => renderParticle(ctx, p));
        return; // static frame only
      }
      const dt = lastTimeRef.current ? now - lastTimeRef.current : 16;
      lastTimeRef.current = now;
      ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      const mouse = mouseRef.current;
      const particles = particlesRef.current;
      const speedScale = 0.06 * speedFactor;
      particles.forEach((p) => {
        p.x += p.vx * dt * speedScale;
        p.y += p.vy * dt * speedScale;
        if (p.x < -5) p.x = width + 5;
        if (p.x > width + 5) p.x = -5;
        if (p.y < -5) p.y = height + 5;
        if (p.y > height + 5) p.y = -5;
        p.glow += 0.002 * dt;
        if (p.glow > Math.PI * 2) p.glow -= Math.PI * 2;
        if (mouse.active) {
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const dist2 = dx * dx + dy * dy;
          const influence = dist2 < 16000 ? 1 - dist2 / 16000 : 0;
          p.radius = p.baseRadius + influence * 2.2;
        } else {
          p.radius += (p.baseRadius - p.radius) * 0.05;
        }
        renderParticle(ctx, p);
      });

      // Connecting lines (adaptive: exhaustive below threshold, sampled above)
      if (connectLines) {
        const n = particles.length;
        const maxDist2 = lineDistance * lineDistance;
        let linesDrawn = 0;
        const budget = targetLines;
        if (n <= maxLineParticles) {
          // Full pair scan with budget early exit
          for (let i = 0; i < n && linesDrawn < budget; i++) {
            const p1 = particles[i];
            for (let j = i + 1; j < n && linesDrawn < budget; j++) {
              const p2 = particles[j];
              const dx = p1.x - p2.x;
              const dy = p1.y - p2.y;
              const dist2 = dx * dx + dy * dy;
              if (dist2 < maxDist2) {
                const dist = Math.sqrt(dist2);
                const t = 1 - dist / lineDistance;
                let alpha = (0.5 * t + 0.15) * brightness;
                if (alpha > 0.9) alpha = 0.9;
                ctx.lineWidth = (0.7 + 1.6 * t) * lineWidthFactor;
                ctx.strokeStyle = toRGBA(lineColor, alpha);
                ctx.beginPath();
                ctx.moveTo(p1.x, p1.y);
                ctx.lineTo(p2.x, p2.y);
                ctx.stroke();
                linesDrawn++;
              }
            }
          }
        } else {
          // Random sampling of pairs
          const attemptsLimit = budget * 4; // heuristic oversampling factor
          for (
            let attempts = 0;
            attempts < attemptsLimit && linesDrawn < budget;
            attempts++
          ) {
            const i = (Math.random() * n) | 0;
            let j = (Math.random() * n) | 0;
            if (i === j) continue;
            const p1 = particles[i];
            const p2 = particles[j];
            const dx = p1.x - p2.x;
            const dy = p1.y - p2.y;
            const dist2 = dx * dx + dy * dy;
            if (dist2 < maxDist2) {
              const dist = Math.sqrt(dist2);
              const t = 1 - dist / lineDistance;
              let alpha = (0.5 * t + 0.15) * brightness;
              if (alpha > 0.9) alpha = 0.9;
              ctx.lineWidth = (0.7 + 1.6 * t) * lineWidthFactor;
              ctx.strokeStyle = toRGBA(lineColor, alpha);
              ctx.beginPath();
              ctx.moveTo(p1.x, p1.y);
              ctx.lineTo(p2.x, p2.y);
              ctx.stroke();
              linesDrawn++;
            }
          }
        }
      }
    };

    const loop = (now: number) => {
      draw(now);
      if (!reducedMotion.current) {
        animationRef.current = requestAnimationFrame(loop);
      }
    };

    resize();
    if (!reducedMotion.current) {
      animationRef.current = requestAnimationFrame(loop);
    } else {
      draw(performance.now());
    }

    window.addEventListener("resize", resize);
    const onMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current.x = e.clientX - rect.left;
      mouseRef.current.y = e.clientY - rect.top;
      mouseRef.current.active = true;
    };
    const onLeave = () => (mouseRef.current.active = false);
    canvas.addEventListener("mousemove", onMove);
    canvas.addEventListener("mouseleave", onLeave);

    return () => {
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("mousemove", onMove);
      canvas.removeEventListener("mouseleave", onLeave);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [
    baseCount,
    connectLines,
    lineDistance,
    speedFactor,
    particleColor,
    glowColor,
    lineColor,
    sizeFactor,
    brightness,
    lineWidthFactor,
    maxMultiplier,
    maxLineParticles,
    targetLines,
  ]);

  return (
    <canvas
      ref={canvasRef}
      className={`w-full h-full block ${className}`}
      style={{ filter: "blur(0.3px)", opacity: 0.9 }}
      aria-hidden="true"
    />
  );
};

export default ParticleField;
