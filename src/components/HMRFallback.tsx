import React from 'react';

export const HMRFallback = () => {
  const handleReload = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="text-center p-8 max-w-md">
        <div className="mb-6">
          <div className="animate-pulse text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold mb-2">App Reload Required</h1>
          <p className="text-zinc-400 mb-6">
            Hot Module Reload caused a React state corruption. 
            Please reload the page to continue.
          </p>
        </div>
        
        <button
          onClick={handleReload}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
        >
          Reload App
        </button>
        
        <p className="text-xs text-zinc-500 mt-4">
          This happens during development when code changes.
        </p>
      </div>
    </div>
  );
};

export default HMRFallback;