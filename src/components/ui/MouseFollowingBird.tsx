import React, { useEffect, useRef, useState } from "react";

interface MouseFollowingBirdProps {
  className?: string;
}

export const MouseFollowingBird: React.FC<MouseFollowingBirdProps> = ({
  className = "",
}) => {
  const birdRef = useRef<HTMLDivElement>(null);
  const [eyeOffset, setEyeOffset] = useState({ x: 0, y: 0 });
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!birdRef.current) return;
      
      const rect = birdRef.current.getBoundingClientRect();
      const birdX = rect.left + rect.width / 2;
      const birdY = rect.top + rect.height / 2;
      
      // Calculate angle from bird to mouse
      const dx = e.clientX - birdX;
      const dy = e.clientY - birdY;
      
      // Rotate bird body slightly toward mouse
      const angle = Math.atan2(dy, dx) * (180 / Math.PI);
      setRotation(angle * 0.3);
      
      // Calculate eye offset
      const distance = Math.sqrt(dx * dx + dy * dy);
      const maxDistance = 100;
      const maxOffset = 3;
      
      const normalizedX = distance > 0 ? dx / distance : 0;
      const normalizedY = distance > 0 ? dy / distance : 0;
      
      const offsetX = normalizedX * Math.min(distance, maxDistance) * (maxOffset / maxDistance);
      const offsetY = normalizedY * Math.min(distance, maxDistance) * (maxOffset / maxDistance);
      
      setEyeOffset({ x: offsetX, y: offsetY });
    };

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <div
      ref={birdRef}
      className={`relative transition-transform duration-150 ease-out ${className}`}
      style={{ transform: `rotate(${rotation}deg)` }}
    >
      {/* Bird SVG */}
      <svg
        width="60"
        height="60"
        viewBox="0 0 100 100"
        className="drop-shadow-lg"
      >
        {/* Bird body */}
        <ellipse
          cx="50"
          cy="60"
          rx="35"
          ry="25"
          fill="currentColor"
          className="text-blue-500 dark:text-cyan-400"
        />
        
        {/* Bird head */}
        <circle
          cx="50"
          cy="40"
          r="20"
          fill="currentColor"
          className="text-blue-400 dark:text-cyan-300"
        />
        
        {/* Wing */}
        <ellipse
          cx="45"
          cy="55"
          rx="15"
          ry="12"
          fill="currentColor"
          className="text-blue-600 dark:text-cyan-500"
          opacity="0.8"
        />
        
        {/* Beak */}
        <polygon
          points="70,40 80,43 70,46"
          fill="currentColor"
          className="text-orange-400 dark:text-orange-300"
        />
        
        {/* Eyes */}
        <g style={{ transition: 'transform 0.1s ease-out' }}>
          {/* Eye 1 - white */}
          <circle
            cx="35"
            cy="35"
            r="5"
            fill="white"
          />
          {/* Eye 1 - pupil */}
          <circle
            cx={35 + eyeOffset.x}
            cy={35 + eyeOffset.y}
            r="3"
            fill="black"
          />
          
          {/* Eye 2 - white */}
          <circle
            cx="45"
            cy="35"
            r="5"
            fill="white"
          />
          {/* Eye 2 - pupil */}
          <circle
            cx={45 + eyeOffset.x}
            cy={35 + eyeOffset.y}
            r="3"
            fill="black"
          />
        </g>
        
        {/* Tail */}
        <path
          d="M 15 70 Q 10 65 5 70 Q 10 75 15 70"
          fill="currentColor"
          className="text-blue-500 dark:text-cyan-400"
        />
      </svg>
    </div>
  );
};

