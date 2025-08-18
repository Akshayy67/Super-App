import React, { useRef, useState, useEffect } from "react";
import { LoadingGlobe } from "./LoadingGlobe";

interface GoogleSignInButtonProps {
  onClick: () => void;
  loading?: boolean;
  disabled?: boolean;
}

export const GoogleSignInButton: React.FC<GoogleSignInButtonProps> = ({
  onClick,
  loading = false,
  disabled = false,
}) => {
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const [ripple, setRipple] = useState<{
    x: number;
    y: number;
    ts: number;
  } | null>(null);
  const [hovered, setHovered] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const handler = () => setReducedMotion(mq.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    if (!ripple) return;
    const t = setTimeout(() => setRipple(null), 650);
    return () => clearTimeout(t);
  }, [ripple]);

  const handleClick = (e: React.MouseEvent) => {
    if (disabled || loading) return;
    const rect = btnRef.current?.getBoundingClientRect();
    if (rect) {
      setRipple({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        ts: Date.now(),
      });
    }
    onClick();
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!btnRef.current || reducedMotion) return;
    const rect = btnRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -6;
    const rotateY = ((x - centerX) / centerX) * 6;
    btnRef.current.style.setProperty("--rx", rotateX.toFixed(2) + "deg");
    btnRef.current.style.setProperty("--ry", rotateY.toFixed(2) + "deg");
    btnRef.current.style.setProperty("--mx", x + "px");
    btnRef.current.style.setProperty("--my", y + "px");
  };

  const resetTilt = () => {
    if (!btnRef.current) return;
    btnRef.current.style.setProperty("--rx", "0deg");
    btnRef.current.style.setProperty("--ry", "0deg");
  };

  return (
    <button
      ref={btnRef}
      type="button"
      aria-label="Sign in with Google"
      aria-busy={loading}
      onClick={handleClick}
      disabled={disabled || loading}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => {
        setHovered(false);
        resetTilt();
      }}
      onBlur={resetTilt}
      className="relative group w-full rounded-2xl disabled:cursor-not-allowed focus-visible:outline-none [perspective:1000px]"
      style={{
        transform: !reducedMotion ? "translateZ(0)" : undefined,
      }}
    >
      <span
        className="block rounded-2xl p-[2px] transition-shadow duration-300"
        style={{
          boxShadow: hovered
            ? "0 4px 22px -4px rgba(99,102,241,0.45), 0 2px 8px -2px rgba(59,130,246,0.4)"
            : "0 2px 10px -2px rgba(99,102,241,0.25)",
          background: hovered
            ? "linear-gradient(110deg, rgba(129,140,248,0.85), rgba(96,165,250,0.75), rgba(129,140,248,0.85))"
            : "linear-gradient(110deg, rgba(129,140,248,0.55), rgba(96,165,250,0.45), rgba(129,140,248,0.55))",
          transform: !reducedMotion
            ? "rotateX(var(--rx,0deg)) rotateY(var(--ry,0deg))"
            : undefined,
          transformStyle: "preserve-3d",
        }}
      >
        <span
          className="relative flex items-center justify-center gap-3 w-full rounded-[1rem] bg-white/92 backdrop-blur-sm px-5 py-3.5 text-gray-800 font-medium text-sm sm:text-base tracking-wide transition-colors duration-300 select-none"
          style={{
            background: hovered
              ? "radial-gradient(circle at var(--mx,50%) var(--my,50%), rgba(255,255,255,0.95), rgba(255,255,255,0.86))"
              : undefined,
          }}
        >
          <span
            className="pointer-events-none absolute inset-0 rounded-[1rem] opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            style={{
              background:
                "radial-gradient(circle at var(--mx,50%) var(--my,50%), rgba(255,255,255,0.65), transparent 70%)",
              mixBlendMode: "overlay",
            }}
          />
          <span className="pointer-events-none absolute inset-0 rounded-[1rem] bg-gradient-to-br from-indigo-50/60 via-transparent to-sky-50/70 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <span
            className="pointer-events-none absolute inset-0 rounded-[1rem] opacity-[0.12] mix-blend-multiply"
            style={{
              backgroundImage:
                "radial-gradient(rgba(0,0,0,0.35) 1px, transparent 1px)",
              backgroundSize: "3px 3px",
            }}
          />
          <span className="pointer-events-none absolute inset-0 overflow-hidden rounded-[1rem]">
            {Array.from({ length: 14 }).map((_, i) => (
              <span
                key={i}
                className="absolute w-1 h-1 rounded-full bg-blue-400/60"
                style={{
                  top: ((Math.sin(i * 12.989) * 43758.5453) % 100) + "%",
                  left: ((Math.sin(i * 78.233) * 9645.5453) % 100) + "%",
                  opacity: 0.3 + (i % 5) * 0.12,
                  animation: reducedMotion
                    ? undefined
                    : `pfFloat ${(4 + (i % 5)) * 1.2}s ease-in-out ${
                        (i % 7) * 0.6
                      }s infinite alternate`,
                  filter: "blur(0.5px)",
                }}
              />
            ))}
          </span>
          {loading ? (
            <LoadingGlobe size={26} color="rgb(99,102,241)" />
          ) : (
            <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
          )}
          <span className="relative z-10">
            {loading ? "Signing in..." : "Continue with Google"}
          </span>
          {ripple && (
            <span
              className="pointer-events-none absolute rounded-full bg-indigo-400/30 dark:bg-indigo-300/25 animate-[ripple_0.65s_ease-out_forwards]"
              style={{
                top: ripple.y - 120,
                left: ripple.x - 120,
                width: 240,
                height: 240,
              }}
            />
          )}
        </span>
      </span>
      <span className="pointer-events-none absolute inset-0 rounded-2xl ring-0 ring-indigo-400/0 group-focus-visible:ring-4 group-focus-visible:ring-indigo-400/40 transition-all duration-300" />
      {loading && (
        <span className="absolute left-0 bottom-0 h-[3px] w-full overflow-hidden rounded-b-2xl">
          <span className="absolute inset-0 bg-gradient-to-r from-indigo-400 via-blue-400 to-indigo-500 animate-[progress_1.4s_linear_infinite]" />
        </span>
      )}
      <style>{`
        @keyframes ripple { 0% { transform: scale(0); opacity: .55;} 70% {opacity:.35;} 100% { transform: scale(1); opacity:0;} }
        @keyframes pfFloat { 0% { transform: translateY(0px);} 100% { transform: translateY(-9px);} }
        @keyframes progress { from { transform: translateX(-60%);} to { transform: translateX(60%);} }
      `}</style>
    </button>
  );
};

export default GoogleSignInButton;
