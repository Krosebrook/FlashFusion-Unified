import React from 'react';

const ProgressTracker = () => {
  return (
    <div className="mt-4">
      <label className="block text-lg font-medium mb-2">Progress:</label>
      <progress className="w-full" value="30" max="100">30%</progress>
    </div>
  );
};

export default ProgressTracker;