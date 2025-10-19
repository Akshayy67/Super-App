import React, { useEffect, useRef } from "react";

interface LoadingGlobeProps {
  size?: number;
  className?: string;
  color?: string;
}

export const LoadingGlobe: React.FC<LoadingGlobeProps> = ({
  size = 60,
  className = "",
  color = "rgb(30, 41, 59)", // Default dark slate
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const timeRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = size * 2;
    canvas.height = size * 2;
    ctx.scale(2, 2);

    const animate = () => {
      timeRef.current += 0.02;
      const time = timeRef.current;

      ctx.clearRect(0, 0, size, size);

      const centerX = size / 2;
      const centerY = size / 2;
      const radius = size * 0.3;

      // Draw rotating wireframe globe with darker colors
      ctx.strokeStyle = `${color
        .replace("rgb", "rgba")
        .replace(")", ", 0.9)")}`;
      ctx.lineWidth = 1.5;

      // Longitudinal lines
      for (let i = 0; i < 6; i++) {
        const angle = (i * Math.PI) / 3 + time;
        ctx.beginPath();
        for (let j = 0; j <= 20; j++) {
          const phi = (j * Math.PI) / 20;
          const x = centerX + Math.cos(angle) * Math.sin(phi) * radius;
          const y = centerY + Math.cos(phi) * radius;
          const z = Math.sin(angle) * Math.sin(phi) * radius;

          if (z > -radius * 0.5) {
            // Only draw front half
            if (j === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
      }

      // Latitudinal lines
      for (let i = 1; i < 5; i++) {
        const phi = (i * Math.PI) / 5;
        const ringRadius = Math.sin(phi) * radius;
        const y = centerY + Math.cos(phi) * radius;

        ctx.beginPath();
        for (let j = 0; j <= 20; j++) {
          const theta = (j * Math.PI * 2) / 20 + time * 0.5;
          const x = centerX + Math.cos(theta) * ringRadius;
          const z = Math.sin(theta) * ringRadius;

          if (z > -radius * 0.5) {
            // Only draw front half
            if (j === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
      }

      // Add pulsing nodes
      const nodes = [
        { angle: time * 0.5, phi: Math.PI * 0.3 },
        { angle: time * 0.7 + Math.PI * 0.5, phi: Math.PI * 0.5 },
        { angle: time * 0.3 + Math.PI, phi: Math.PI * 0.7 },
      ];

      nodes.forEach((node) => {
        const x = centerX + Math.cos(node.angle) * Math.sin(node.phi) * radius;
        const y = centerY + Math.cos(node.phi) * radius;
        const z = Math.sin(node.angle) * Math.sin(node.phi) * radius;

        if (z > -radius * 0.5) {
          const pulse = Math.sin(time * 4) * 0.3 + 0.7;
          const nodeSize = 2 * pulse;

          // Darker glow effect
          const gradient = ctx.createRadialGradient(
            x,
            y,
            0,
            x,
            y,
            nodeSize * 2
          );
          gradient.addColorStop(
            0,
            `${color.replace("rgb", "rgba").replace(")", ", 1)")}`
          );
          gradient.addColorStop(
            0.5,
            `${color.replace("rgb", "rgba").replace(")", ", 0.6)")}`
          );
          gradient.addColorStop(
            1,
            `${color.replace("rgb", "rgba").replace(")", ", 0)")}`
          );

          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(x, y, nodeSize * 2, 0, Math.PI * 2);
          ctx.fill();

          // Darker solid center
          ctx.fillStyle = `${color.replace("rgb", "rgba").replace(")", ", 0.95)")}`;
          ctx.beginPath();
          ctx.arc(x, y, nodeSize * 0.3, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [size]);

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      className={`${className}`}
      style={{ width: size, height: size }}
    />
  );
};
