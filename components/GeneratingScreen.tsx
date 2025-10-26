import React from 'react';

const LoadingSpinner: React.FC = () => (
  <div className="w-16 h-16 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin"></div>
);

export const GeneratingScreen: React.FC = () => {
  return (
    <div className="flex flex-col h-full w-full items-center justify-center bg-orange-50 text-center p-8">
      <LoadingSpinner />
      <h1 className="text-2xl font-bold text-gray-800 mt-8">您的故事正在绘制中！</h1>
      <p className="text-gray-500 mt-2">我们的AI正在努力为您绘制奇妙的冒险。请稍等片刻。</p>
    </div>
  );
};