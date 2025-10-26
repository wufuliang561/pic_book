
import React from 'react';

export const Illustration3: React.FC = () => (
  <div className="w-full h-full flex items-center justify-center bg-gradient-to-b from-orange-100 via-amber-50 to-[#FDFBF8]">
    <svg viewBox="0 0 400 400" className="w-full h-auto max-w-md">
      {/* Background */}
      <rect width="400" height="400" fill="#E8F5E9" />
      <path d="M0 400 Q 200 300, 400 400" fill="#C8E6C9" />
      <path d="M0 400 Q 200 350, 400 400" fill="#A5D6A7" />

      {/* Flower Stems */}
      <path d="M100 400 C 120 300, 80 200, 100 150" stroke="#81C784" fill="none" strokeWidth="5" />
      <path d="M200 400 C 180 300, 220 200, 200 100" stroke="#81C784" fill="none" strokeWidth="5" />
      <path d="M300 400 C 280 300, 320 200, 300 150" stroke="#81C784" fill="none" strokeWidth="5" />

      {/* Star Flowers */}
      <g transform="translate(100 150) rotate(20)">
        <path d="M 0 -30 L 7 -10 L 28 -8 L 12 5 L 17 25 L 0 15 L -17 25 L -12 5 L -28 -8 L -7 -10 Z" fill="#FF8A65" />
        <circle cx="0" cy="0" r="7" fill="#FFF" />
      </g>
      <g transform="translate(200 100) rotate(-10)">
        <path d="M 0 -30 L 7 -10 L 28 -8 L 12 5 L 17 25 L 0 15 L -17 25 L -12 5 L -28 -8 L -7 -10 Z" fill="#FF8A65" />
        <circle cx="0" cy="0" r="7" fill="#FFF" />
      </g>
      <g transform="translate(300 150) rotate(-20)">
        <path d="M 0 -30 L 7 -10 L 28 -8 L 12 5 L 17 25 L 0 15 L -17 25 L -12 5 L -28 -8 L -7 -10 Z" fill="#FF8A65" />
        <circle cx="0" cy="0" r="7" fill="#FFF" />
      </g>
      
      {/* Characters */}
      {/* Girl in Orange */}
      <g transform="translate(80 250)">
        <path d="M 0 100 L 40 100 L 30 0 L 10 0 Z" fill="#FF8A65" />
        <circle cx="20" cy="0" r="15" fill="#FFF" />
        <path d="M 5 0 Q 20 -20, 35 0" fill="#FFF" stroke="#E0E0E0" strokeWidth="2" />
        <circle cx="20" cy="-5" r="18" fill="none" stroke="#FFF" strokeWidth="4" />
      </g>

      {/* Boy */}
      <g transform="translate(280 270)">
        <path d="M 0 80 L 40 80 L 30 0 L 10 0 Z" fill="#4A90E2" />
        <circle cx="20" cy="0" r="15" fill="#FFE0B2" />
        <rect x="5" y="-15" width="30" height="10" fill="#FFF" rx="3" />
      </g>

      {/* Girl in Blue */}
      <g transform="translate(150 120) scale(0.9)">
        <path d="M 0 100 L 40 100 L 30 0 L 10 0 Z" fill="#4FC3F7" />
        <circle cx="20" cy="0" r="15" fill="#FFE0B2" />
        <path d="M 5 0 Q 20 -20, 35 0" fill="#4A4A4A" stroke="#4A4A4A" strokeWidth="2" />
        <circle cx="20" cy="-5" r="18" fill="none" stroke="#4A4A4A" strokeWidth="4" />
      </g>
      
      {/* Reward bags */}
      <g transform="translate(150 300)">
        <path d="M 0 0 C -20 20, 20 20, 40 0 L 30 50 L 10 50 Z" fill="#FFB74D" />
        <circle cx="20" cy="25" r="10" stroke="#F57C00" strokeWidth="2" fill="none" />
        <path d="M20 20 L 22 25 L 27 26 L 23 29 L 24 34 L 20 31 L 16 34 L 17 29 L 13 26 L 18 25 Z" fill="#F57C00" />
      </g>
      <g transform="translate(230 320) scale(0.8)">
        <path d="M 0 0 C -20 20, 20 20, 40 0 L 30 50 L 10 50 Z" fill="#FFB74D" />
        <circle cx="20" cy="25" r="10" stroke="#F57C00" strokeWidth="2" fill="none" />
        <path d="M20 20 L 22 25 L 27 26 L 23 29 L 24 34 L 20 31 L 16 34 L 17 29 L 13 26 L 18 25 Z" fill="#F57C00" />
      </g>
    </svg>
  </div>
);
