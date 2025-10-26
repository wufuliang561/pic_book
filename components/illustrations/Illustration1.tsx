
import React from 'react';

export const Illustration1: React.FC = () => (
  <div className="w-full h-full flex items-center justify-center bg-gradient-to-b from-orange-100 via-amber-50 to-[#FDFBF8]">
    <svg viewBox="0 0 400 400" className="w-full h-auto max-w-md">
      {/* Background elements */}
      <circle cx="200" cy="200" r="180" fill="url(#grad1)" />
      <defs>
        <radialGradient id="grad1" cx="50%" cy="40%" r="50%" fx="50%" fy="40%">
          <stop offset="0%" style={{ stopColor: '#FFEACC', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#FFDAB9', stopOpacity: 1 }} />
        </radialGradient>
      </defs>

      {/* Desert */}
      <path d="M0 400 Q 100 300, 200 320 T 400 350 V 400 H 0 Z" fill="#FADCB9" />
      <path d="M0 400 Q 80 350, 180 360 T 400 320 V 400 H 0 Z" fill="#F8C9A3" />
      
      {/* Camel */}
      <path d="M 60 330 C 70 300, 90 300, 100 330 L 110 330 L 115 305 L 120 330 L 130 330 C 140 300, 160 300, 170 330 V 360 H 150 V 335 H 80 V 360 H 60 Z" fill="#D4A276" transform="translate(-10, -30) scale(0.6)" />

      {/* Book */}
      <path d="M50 280 Q 200 200, 350 280 L 340 300 Q 200 230, 60 300 Z" fill="#4a5568" />
      <path d="M55 285 Q 200 210, 345 285 L 340 295 Q 200 225, 60 295 Z" fill="#f7fafc" />
      <rect x="195" y="220" width="10" height="70" fill="#e53e3e" transform="rotate(5 200 255)"/>

      {/* Mosque Silhouette */}
      <path d="M120 280 L 120 230 C 120 210, 140 210, 140 230 L 140 280" fill="#a0aec0" />
      <path d="M260 280 L 260 230 C 260 210, 280 210, 280 230 L 280 280" fill="#a0aec0" />
      <rect x="140" y="240" width="120" height="40" fill="#a0aec0" />
      <path d="M170 240 Q 200 200, 230 240" fill="#a0aec0" />
      <circle cx="200" cy="195" r="8" fill="#a0aec0" />
      <path d="M198 195 L 202 195 L 200 185 Z" fill="#a0aec0" />
      <circle cx="130" cy="205" r="5" fill="#a0aec0" />
      <circle cx="270" cy="205" r="5" fill="#a0aec0" />

      {/* Floating elements */}
      <g transform="translate(-50 0) rotate(-15 150 150)">
        <rect x="120" y="130" width="50" height="30" fill="#f7fafc" rx="3" stroke="#cbd5e0" strokeWidth="1" />
        <line x1="125" y1="138" x2="160" y2="138" stroke="#cbd5e0" strokeWidth="1" />
        <line x1="125" y1="145" x2="155" y2="145" stroke="#cbd5e0" strokeWidth="1" />
      </g>
       <g transform="translate(100 0) rotate(15 250 150)">
        <rect x="230" y="140" width="50" height="35" fill="#e2e8f0" rx="3" />
        <path d="M 235 150 L 250 145 L 275 165 L 260 170 Z" fill="#718096" opacity="0.5" />
      </g>
      
      {/* Palm Trees */}
      <g transform="translate(100 130) scale(0.8)">
        <path d="M 50 100 C 45 50, 55 50, 50 0" stroke="#4a5568" fill="none" strokeWidth="3" />
        <path d="M 50 5 C 20 -10, 80 -10, 50 5" fill="#4a5568" />
        <path d="M 50 15 C 10 10, 90 10, 50 15" fill="#4a5568" />
      </g>
       <g transform="translate(150 120) scale(1)">
        <path d="M 50 100 C 45 50, 55 50, 50 0" stroke="#4a5568" fill="none" strokeWidth="3" />
        <path d="M 50 5 C 20 -10, 80 -10, 50 5" fill="#4a5568" />
        <path d="M 50 15 C 10 10, 90 10, 50 15" fill="#4a5568" />
      </g>
    </svg>
  </div>
);
