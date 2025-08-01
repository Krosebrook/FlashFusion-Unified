import React from 'react';

const platforms = ['Web', 'Mobile', 'Desktop', 'CLI', 'Extension'];

const PlatformSelector = () => {
  return (
    <div className="mb-4">
      <label className="block text-lg font-medium mb-2">Select Platform:</label>
      <select className="border p-2 rounded w-full">
        {platforms.map((platform) => (
          <option key={platform}>{platform}</option>
        ))}
      </select>
    </div>
  );
};

export default PlatformSelector;