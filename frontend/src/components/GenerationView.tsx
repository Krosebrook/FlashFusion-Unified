import React, { useState, useEffect } from 'react';
import { AppConfig, GenerationProgress } from '../types';

interface GenerationViewProps {
  config: AppConfig;
  isGenerating: boolean;
  onReset: () => void;
}

const GenerationView: React.FC<GenerationViewProps> = ({
  config,
  isGenerating,
  onReset
}) => {
  const [progress, setProgress] = useState<GenerationProgress>({
    step: 'Initializing...',
    progress: 0,
    message: 'Preparing to generate your application',
    status: 'pending'
  });

  const [generationComplete, setGenerationComplete] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string>('');

  useEffect(() => {
    if (isGenerating) {
      simulateGeneration();
    }
  }, [isGenerating]);

  const simulateGeneration = async () => {
    const steps = [
      { step: 'Analyzing requirements...', progress: 10, message: 'Processing your configuration' },
      { step: 'Generating project structure...', progress: 25, message: 'Creating file structure and dependencies' },
      { step: 'Building core components...', progress: 40, message: 'Generating React components and pages' },
      { step: 'Setting up API integration...', progress: 60, message: 'Configuring backend services and endpoints' },
      { step: 'Applying styling and UI...', progress: 80, message: 'Adding Tailwind CSS and responsive design' },
      { step: 'Finalizing deployment...', progress: 95, message: 'Preparing deployment configuration' },
      { step: 'Generation complete!', progress: 100, message: 'Your application is ready!' }
    ];

    for (let i = 0; i < steps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 1500));
      setProgress({
        ...steps[i],
        status: i === steps.length - 1 ? 'completed' : 'running'
      });
    }

    setGenerationComplete(true);
    setDownloadUrl('https://example.com/download/app.zip');
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Generating Your Application
        </h2>
        <p className="text-gray-600">
          Creating your {config.platform} application with {config.name}
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">
              {progress.step}
            </span>
            <span className="text-sm text-gray-500">
              {progress.progress}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${progress.progress}%` }}
            />
          </div>
        </div>
        
        <p className="text-sm text-gray-600">{progress.message}</p>
      </div>

      {generationComplete && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
          <div className="flex items-center mb-4">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <div className="ml-3">
              <h3 className="text-lg font-medium text-green-800">
                Generation Complete!
              </h3>
              <p className="text-sm text-green-700">
                Your application has been successfully generated.
              </p>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Platform:</span>
              <span className="text-sm font-medium text-gray-900">{config.platform}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Name:</span>
              <span className="text-sm font-medium text-gray-900">{config.name}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Features:</span>
              <span className="text-sm font-medium text-gray-900">
                {config.features.length} selected
              </span>
            </div>
          </div>

          <div className="mt-6 flex space-x-3">
            <a
              href={downloadUrl}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md text-center hover:bg-blue-700 transition-colors"
            >
              Download Project
            </a>
            <button
              onClick={onReset}
              className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors"
            >
              Generate Another
            </button>
          </div>
        </div>
      )}

      {!generationComplete && (
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-sm text-gray-600">Please wait while we generate your application...</p>
        </div>
      )}
    </div>
  );
};

export default GenerationView;