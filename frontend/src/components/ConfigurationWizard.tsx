import React, { useState } from 'react';
import { AppConfig } from '../types';

interface ConfigurationWizardProps {
  step: number;
  config: AppConfig;
  onConfigChange: (config: AppConfig) => void;
  onNext: () => void;
  onPrevious: () => void;
  onGenerate: () => void;
}

const ConfigurationWizard: React.FC<ConfigurationWizardProps> = ({
  step,
  config,
  onConfigChange,
  onNext,
  onPrevious,
  onGenerate
}) => {
  const [localConfig, setLocalConfig] = useState<AppConfig>(config);

  const handleConfigChange = (updates: Partial<AppConfig>) => {
    const newConfig = { ...localConfig, ...updates };
    setLocalConfig(newConfig);
    onConfigChange(newConfig);
  };

  const handleNext = () => {
    onConfigChange(localConfig);
    onNext();
  };

  const renderStep = () => {
    switch (step) {
      case 2:
        return (
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                App Configuration
              </h2>
              <p className="text-gray-600">
                Configure your application details
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Application Name
                </label>
                <input
                  type="text"
                  value={localConfig.name}
                  onChange={(e) => handleConfigChange({ name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="My Awesome App"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={localConfig.description}
                  onChange={(e) => handleConfigChange({ description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Describe what your app does..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Template
                </label>
                <select
                  value={localConfig.template}
                  onChange={(e) => handleConfigChange({ template: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a template</option>
                  <option value="basic">Basic Template</option>
                  <option value="advanced">Advanced Template</option>
                  <option value="custom">Custom Template</option>
                </select>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Features & Capabilities
              </h2>
              <p className="text-gray-600">
                Select the features you want in your app
              </p>
            </div>

            <div className="space-y-4">
              {[
                'Authentication',
                'Database Integration',
                'API Endpoints',
                'Real-time Updates',
                'File Upload',
                'Search Functionality',
                'Analytics Dashboard',
                'Email Notifications'
              ].map((feature) => (
                <label key={feature} className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={localConfig.features.includes(feature)}
                    onChange={(e) => {
                      const newFeatures = e.target.checked
                        ? [...localConfig.features, feature]
                        : localConfig.features.filter(f => f !== feature);
                      handleConfigChange({ features: newFeatures });
                    }}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-gray-700">{feature}</span>
                </label>
              ))}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Deployment Options
              </h2>
              <p className="text-gray-600">
                Configure where to deploy your application
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Deployment Target
                </label>
                <select
                  value={localConfig.deployment.target}
                  onChange={(e) => handleConfigChange({
                    deployment: { ...localConfig.deployment, target: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select deployment target</option>
                  <option value="vercel">Vercel</option>
                  <option value="netlify">Netlify</option>
                  <option value="github-pages">GitHub Pages</option>
                  <option value="aws">AWS</option>
                  <option value="local">Local Development</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Custom Domain (Optional)
                </label>
                <input
                  type="text"
                  value={localConfig.deployment.domain}
                  onChange={(e) => handleConfigChange({
                    deployment: { ...localConfig.deployment, domain: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="myapp.com"
                />
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div>
      {renderStep()}
      
      <div className="flex justify-between mt-8">
        <button
          onClick={onPrevious}
          className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
        >
          Previous
        </button>
        
        <button
          onClick={step === 4 ? onGenerate : handleNext}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          {step === 4 ? 'Generate App' : 'Next'}
        </button>
      </div>
    </div>
  );
};

export default ConfigurationWizard;