
import React from 'react';

export const Illustration2: React.FC = () => (
  <div className="w-full h-full flex items-center justify-center bg-gradient-to-b from-orange-100 via-amber-50 to-[#FDFBF8]">
    <svg viewBox="0 0 400 400" className="w-full h-auto max-w-md">
      {/* Background */}
      <circle cx="200" cy="200" r="180" fill="url(#grad2)" />
      <defs>
        <radialGradient id="grad2" cx="50%" cy="40%" r="50%" fx="50%" fy="40%">
          <stop offset="0%" style={{ stopColor: '#FFFBEB', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#FFE4B5', stopOpacity: 1 }} />
        </radialGradient>
      </defs>

      {/* Stars */}
      <path d="M100 100 L 105 110 L 115 112 L 105 114 L 100 124 L 95 114 L 85 112 L 95 110 Z" fill="#FFD700" opacity="0.7"/>
      <path d="M300 150 L 304 158 L 312 160 L 304 162 L 300 170 L 296 162 L 288 160 L 296 158 Z" fill="#FFD700" opacity="0.7"/>
      <path d="M120 300 L 123 306 L 129 307 L 123 308 L 120 314 L 117 308 L 111 307 L 117 306 Z" fill="#FFD700" opacity="0.7"/>

      {/* Mosque Silhouette */}
      <path d="M120 380 L 120 330 C 120 310, 140 310, 140 330 L 140 380" fill="#F9A826" />
      <path d="M260 380 L 260 330 C 260 310, 280 310, 280 330 L 280 380" fill="#F9A826" />
      <rect x="140" y="340" width="120" height="40" fill="#F9A826" />
      <path d="M170 340 Q 200 300, 230 340" fill="#F9A826" />
      <circle cx="200" cy="295" r="8" fill="#F9A826" />
      <path d="M200 270 a 30 30 0 0 1 0 60" stroke="#FBC02D" strokeWidth="5" fill="none" transform="rotate(-30 200 300)"/>

      {/* Question Mark */}
      <g transform="translate(0 -20)">
        <path d="M 160 150 a 40 40 0 1 1 80 0 a 40 40 0 0 1 -40 40 L 200 250" stroke="#FFC107" fill="none" strokeWidth="25" strokeLinecap="round"/>
        <circle cx="200" cy="280" r="12" fill="#FFC107" />
        {/* Face */}
        <circle cx="190" cy="150" r="4" fill="white" />
        <circle cx="210" cy="150" r="4" fill="white" />
        <path d="M195 160 a 5 5 0 0 0 10 0" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round"/>
      </g>
      
      {/* Quiz Cards */}
      <g transform="rotate(-15 100 150)">
        <rect x="80" y="130" width="70" height="40" fill="white" rx="5" stroke="#4DD0E1" strokeWidth="2" />
        <circle cx="95" cy="142" r="5" fill="#F48FB1" />
        <line x1="110" y1="140" x2="135" y2="140" stroke="#B0BEC5" strokeWidth="2" />
        <line x1="110" y1="147" x2="130" y2="147" stroke="#B0BEC5" strokeWidth="2" />
      </g>
      <g transform="rotate(15 300 120)">
        <rect x="250" y="100" width="70" height="40" fill="white" rx="5" stroke="#4DD0E1" strokeWidth="2" />
        <circle cx="265" cy="112" r="5" fill="#81C784" />
        <line x1="280" y1="110" x2="305" y2="110" stroke="#B0BEC5" strokeWidth="2" />
        <line x1="280" y1="117" x2="300" y2="117" stroke="#B0BEC5" strokeWidth="2" />
      </g>
      <g transform="rotate(5 100 250)">
         <rect x="80" y="230" width="70" height="40" fill="white" rx="5" stroke="#4DD0E1" strokeWidth="2" />
        <circle cx="95" cy="242" r="5" fill="#FFD54F" />
        <line x1="110" y1="240" x2="135" y2="240" stroke="#B0BEC5" strokeWidth="2" />
        <line x1="110" y1="247" x2="130" y2="247" stroke="#B0BEC5" strokeWidth="2" />
      </g>

    </svg>
  </div>
);
