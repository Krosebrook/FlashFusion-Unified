import React from 'react';

interface ProgressTrackerProps {
  currentStep: number;
  totalSteps: number;
}

const ProgressTracker: React.FC<ProgressTrackerProps> = ({
  currentStep,
  totalSteps
}) => {
  const steps = [
    { id: 1, name: 'Platform', description: 'Choose platform' },
    { id: 2, name: 'Configure', description: 'App settings' },
    { id: 3, name: 'Features', description: 'Select features' },
    { id: 4, name: 'Deploy', description: 'Deployment options' },
    { id: 5, name: 'Generate', description: 'Create app' }
  ];

  return (
    <div className="max-w-4xl mx-auto mb-8">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <React.Fragment key={step.id}>
            <div className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                  step.id <= currentStep
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {step.id < currentStep ? '✓' : step.id}
              </div>
              <div className="mt-2 text-center">
                <div className="text-sm font-medium text-gray-900">
                  {step.name}
                </div>
                <div className="text-xs text-gray-500">
                  {step.description}
                </div>
              </div>
            </div>
            
            {index < steps.length - 1 && (
              <div
                className={`flex-1 h-1 mx-4 ${
                  step.id < currentStep ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export { ProgressTracker };
export default ProgressTracker;