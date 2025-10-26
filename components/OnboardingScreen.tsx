import React from 'react';
import { OnboardingContent } from '../types';
import { Illustration1 } from './illustrations/Illustration1';
import { Illustration2 } from './illustrations/Illustration2';
import { ProgressBar } from './ProgressBar';

interface OnboardingScreenProps {
  step: number;
  onNext: () => void;
  onSkip: () => void;
}

const onboardingContent: OnboardingContent[] = [
  {
    illustration: Illustration1,
    title: "探索当地文旅特色",
    description: "发现独一无二的风景与传说，开启你的文化之旅。",
  },
  {
    illustration: Illustration2,
    title: "成为故事的主角",
    description: "上传你的照片，AI将为你绘制专属绘本，让你亲身体验故事的奇妙。",
  },
];

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ step, onNext, onSkip }) => {
  const content = onboardingContent[step];
  const Illustration = content.illustration;

  return (
    <div className="flex flex-col h-full w-full">
      <div className="absolute top-4 right-6 z-10">
        <button onClick={onSkip} className="text-gray-500 font-semibold px-4 py-2">
          跳过
        </button>
      </div>
      <div className="flex-grow flex items-center justify-center overflow-hidden -mt-10">
         <Illustration />
      </div>
      <div className="flex-shrink-0 bg-white rounded-t-3xl shadow-[0_-10px_30px_-15px_rgba(0,0,0,0.1)] pt-10 pb-8 px-6 text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-3 leading-tight">{content.title}</h1>
        <p className="text-gray-500 mb-8">{content.description}</p>
        <ProgressBar currentStep={step} totalSteps={2} />
        <button
          onClick={onNext}
          className="w-full bg-[#F98844] text-white font-bold py-4 rounded-full text-lg shadow-lg shadow-orange-200 hover:bg-orange-500 transition-all duration-300"
        >
          {step === 1 ? '开始创作' : '继续'}
        </button>
      </div>
    </div>
  );
};