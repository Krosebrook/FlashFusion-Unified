import React, { useState } from 'react';
import { PlatformSelector } from './components/PlatformSelector';
import { ConfigurationWizard } from './components/ConfigurationWizard';
import { GenerationView } from './components/GenerationView';
import { ProgressTracker } from './components/ProgressTracker';
import { AppConfig } from './types';

export const App: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [appConfig, setAppConfig] = useState<AppConfig>({
    platform: '',
    name: '',
    description: '',
    template: '',
    features: [],
    deployment: {
      target: '',
      domain: ''
    }
  });
  const [isGenerating, setIsGenerating] = useState(false);

  const handleNext = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleGenerate = () => {
    setIsGenerating(true);
    setCurrentStep(5);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Universal App Generator
          </h1>
          <p className="text-xl text-gray-600">
            Generate production-ready applications for any platform
          </p>
        </header>

        <ProgressTracker 
          currentStep={currentStep} 
          totalSteps={5} 
        />

        <div className="max-w-4xl mx-auto mt-8">
          {currentStep === 1 && (
            <PlatformSelector
              selectedPlatform={appConfig.platform}
              onSelect={(platform) => setAppConfig({...appConfig, platform})}
              onNext={handleNext}
            />
          )}

          {currentStep >= 2 && currentStep <= 4 && (
            <ConfigurationWizard
              step={currentStep}
              config={appConfig}
              onConfigChange={setAppConfig}
              onNext={handleNext}
              onPrevious={handlePrevious}
              onGenerate={handleGenerate}
            />
          )}

          {currentStep === 5 && (
            <GenerationView
              config={appConfig}
              isGenerating={isGenerating}
              onReset={() => {
                setCurrentStep(1);
                setIsGenerating(false);
                setAppConfig({
                  platform: '',
                  name: '',
                  description: '',
                  template: '',
                  features: [],
                  deployment: { target: '', domain: '' }
                });
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default App;