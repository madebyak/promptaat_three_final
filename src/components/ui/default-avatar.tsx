'use client';

import React from 'react';

interface DefaultAvatarProps {
  size?: number;
  className?: string;
  name?: string;
}

export function DefaultAvatar({ size = 40, className = '', name = '' }: DefaultAvatarProps) {
  // Generate a unique gradient based on the name if provided
  const getGradientColors = () => {
    if (!name) return ['#4ade80', '#818cf8', '#c084fc'];
    
    // Simple hash function to generate consistent colors for the same name
    const hash = name.split('').reduce((acc, char) => {
      return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);
    
    // Generate three colors with some variety but still visually pleasing
    const hue1 = Math.abs(hash % 360);
    const hue2 = (hue1 + 40) % 360;
    const hue3 = (hue2 + 40) % 360;
    
    return [
      `hsl(${hue1}, 80%, 65%)`,
      `hsl(${hue2}, 80%, 65%)`,
      `hsl(${hue3}, 80%, 65%)`
    ];
  };
  
  const colors = getGradientColors();
  const gradientId = `avatar-gradient-${name.replace(/\s+/g, '-').toLowerCase() || 'default'}`;
  
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={colors[0]} />
          <stop offset="50%" stopColor={colors[1]} />
          <stop offset="100%" stopColor={colors[2]} />
        </linearGradient>
      </defs>
      <circle cx="50" cy="50" r="50" fill={`url(#${gradientId})`} />
    </svg>
  );
}
