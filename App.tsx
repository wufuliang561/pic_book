import React, { useState, useCallback } from 'react';
import { OnboardingScreen } from './components/OnboardingScreen';
import { UploadScreen } from './components/UploadScreen';
import { GeneratingScreen } from './components/GeneratingScreen';
import { ResultScreen } from './components/ResultScreen';
import { generateCartoonAvatar, generateStorybook } from './services/geminiService';
import { AppState, StoryPage } from './types';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.Onboarding);
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [userImage, setUserImage] = useState<string | null>(null);
  const [storyPages, setStoryPages] = useState<StoryPage[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleNextOnboarding = () => {
    if (onboardingStep < 1) {
      setOnboardingStep(prev => prev + 1);
    } else {
      setAppState(AppState.Upload);
    }
  };

  const handleSkip = () => {
    setAppState(AppState.Upload);
  };

  const handleImageUpload = (imageDataUrl: string) => {
    setUserImage(imageDataUrl);
  };
  
  const startGeneration = useCallback(async () => {
    if (!userImage) {
      setError("请先上传一张图片。");
      return;
    }

    setAppState(AppState.Generating);
    setError(null);

    try {
      const cartoonAvatar = await generateCartoonAvatar(userImage);
      const pages = await generateStorybook(cartoonAvatar);

      setStoryPages(pages);
      setAppState(AppState.Result);
    } catch (err) {
      console.error(err); // Log the actual error for debugging
      setError("抱歉，生成故事时出错了。请重试。");
      setAppState(AppState.Upload);
    }
  }, [userImage]);
  
  const handleRestart = () => {
    setUserImage(null);
    setStoryPages([]);
    setError(null);
    setOnboardingStep(0);
    setAppState(AppState.Onboarding);
  };

  const renderContent = () => {
    switch (appState) {
      case AppState.Onboarding:
        return (
          <OnboardingScreen
            step={onboardingStep}
            onNext={handleNextOnboarding}
            onSkip={handleSkip}
          />
        );
      case AppState.Upload:
        return (
          <UploadScreen
            onImageUpload={handleImageUpload}
            onGenerate={startGeneration}
            userImage={userImage}
            error={error}
          />
        );
      case AppState.Generating:
        return <GeneratingScreen />;
      case AppState.Result:
        return <ResultScreen pages={storyPages} onRestart={handleRestart} />;
      default:
        return (
          <OnboardingScreen
            step={onboardingStep}
            onNext={handleNextOnboarding}
            onSkip={handleSkip}
          />
        );
    }
  };

  return (
    <div className="bg-[#FDFBF8] min-h-screen font-sans flex items-center justify-center">
      <div className="relative w-full max-w-sm h-[844px] max-h-[844px] overflow-hidden bg-[#FDFBF8] shadow-2xl rounded-3xl">
        {renderContent()}
      </div>
    </div>
  );
};

export default App;