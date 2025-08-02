import React from 'react';
import { Platform } from '../types';

interface PlatformSelectorProps {
  selectedPlatform: string;
  onSelect: (platform: string) => void;
  onNext: () => void;
}

const platforms: Platform[] = [
  {
    id: 'web',
    name: 'Web',
    description: 'React web applications with modern UI',
    icon: '🌐',
    templates: []
  },
  {
    id: 'mobile',
    name: 'Mobile',
    description: 'React Native mobile apps',
    icon: '📱',
    templates: []
  },
  {
    id: 'desktop',
    name: 'Desktop',
    description: 'Electron desktop applications',
    icon: '💻',
    templates: []
  },
  {
    id: 'cli',
    name: 'CLI',
    description: 'Command-line interface tools',
    icon: '⚡',
    templates: []
  },
  {
    id: 'extension',
    name: 'Extension',
    description: 'Browser extensions for Chrome/Firefox',
    icon: '🔧',
    templates: []
  }
];

const PlatformSelector: React.FC<PlatformSelectorProps> = ({
  selectedPlatform,
  onSelect,
  onNext
}) => {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Choose Your Platform
        </h2>
        <p className="text-gray-600">
          Select the platform for your application
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {platforms.map((platform) => (
          <div
            key={platform.id}
            className={`p-6 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
              selectedPlatform === platform.id
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => onSelect(platform.id)}
          >
            <div className="text-3xl mb-3">{platform.icon}</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {platform.name}
            </h3>
            <p className="text-sm text-gray-600">
              {platform.description}
            </p>
          </div>
        ))}
      </div>

      <div className="text-center">
        <button
          onClick={onNext}
          disabled={!selectedPlatform}
          className={`px-8 py-3 rounded-lg font-medium transition-colors ${
            selectedPlatform
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          Continue
        </button>
      </div>
    </div>
  );
};

export { PlatformSelector };
export default PlatformSelector;