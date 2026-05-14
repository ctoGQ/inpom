'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';

interface TierCardProps {
  variant: 'black' | 'gold' | 'business';
  imageUrl: string;
}

export function TierCard({ variant, imageUrl }: TierCardProps) {
  const [isHovering, setIsHovering] = useState(false);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const distX = e.clientX - centerX;
    const distY = e.clientY - centerY;

    const rotX = (distY / (rect.height / 2)) * 15;
    const rotY = (distX / (rect.width / 2)) * 15;

    setRotateX(-rotX);
    setRotateY(rotY);
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    setRotateX(0);
    setRotateY(0);
  };

  const handleMouseEnter = () => {
    setIsHovering(true);
  };

  const getColorAccent = () => {
    switch (variant) {
      case 'black':
        return 'from-white/20 to-white/0';
      case 'gold':
        return 'from-yellow-300/30 to-yellow-300/0';
      case 'business':
        return 'from-purple-300/30 to-purple-300/0';
    }
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="relative w-full cursor-pointer"
      style={{
        perspective: '1000px',
        aspectRatio: '831 / 500',
      }}
    >
      <div
        style={{
          transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
          transition: isHovering ? 'none' : 'transform 0.6s cubic-bezier(0.23, 1, 0.320, 1)',
          transformStyle: 'preserve-3d' as const,
        }}
        className="relative w-full h-full"
      >
        {/* Card */}
        <div className="absolute inset-0 rounded-2xl overflow-hidden border border-white/10">
          <Image
            src={imageUrl}
            alt={`${variant} card`}
            fill
            className="object-cover"
            priority
          />

          {/* Glossy shine overlay */}
          <div
            className={`absolute inset-0 bg-gradient-to-br ${getColorAccent()} transition-opacity duration-300 ${
              isHovering ? 'opacity-100' : 'opacity-0'
            }`}
            style={{
              mixBlendMode: 'screen',
            }}
          />

          {/* Light reflection */}
          <div
            className={`absolute top-0 left-0 w-full h-full rounded-2xl transition-opacity duration-300 ${
              isHovering ? 'opacity-100' : 'opacity-0'
            }`}
            style={{
              background: `radial-gradient(ellipse 800px 200px at ${50 + rotateY * 2}% ${50 + rotateX}%, rgba(255, 255, 255, 0.15) 0%, transparent 60%)`,
              mixBlendMode: 'overlay',
            }}
          />
        </div>

        {/* Back face (subtle) */}
        <div
          className="absolute inset-0 rounded-2xl bg-background border border-white/5"
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
          }}
        />
      </div>
    </div>
  );
}
