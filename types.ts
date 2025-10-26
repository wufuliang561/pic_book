// FIX: Import React to use the React.FC type.sss
import React from 'react';

export enum AppState {
    Onboarding,
    Upload,
    Generating,
    Result,
}

export interface OnboardingContent {
    illustration: React.FC;
    title: string;
    description: string;
}


export interface StoryPage {
    image: string;
    story: string;
}
