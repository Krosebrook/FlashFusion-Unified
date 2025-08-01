import React from 'react';

const ConfigurationWizard = () => {
  return (
    <div className="mb-4">
      <label className="block text-lg font-medium mb-2">Configuration:</label>
      <input type="text" placeholder="Enter config options..." className="border p-2 rounded w-full" />
    </div>
  );
};

export default ConfigurationWizard;