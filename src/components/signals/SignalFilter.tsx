
import React from 'react';

interface SignalFilterProps {
  selectedStrength: string;
  onChange: (strength: string) => void;
}

export const SignalFilter: React.FC<SignalFilterProps> = ({ selectedStrength, onChange }) => {
  const strengthLevels = [
    { value: 'All', label: 'All Signals', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
    { value: 'STANDARD', label: 'Standard', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
    { value: 'MEDIUM', label: 'Medium', color: 'bg-orange-500/20 text-orange-400 border-orange-500/30' },
    { value: 'STRONG', label: 'Strong', color: 'bg-red-500/20 text-red-400 border-red-500/30' },
    { value: 'ULTRA', label: 'Ultra', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' }
  ];

  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {strengthLevels.map((level) => (
        <button
          key={level.value}
          className={`px-3 py-1.5 rounded-lg border transition-all text-sm ${
            selectedStrength === level.value 
              ? `${level.color} scale-105 shadow-md` 
              : 'bg-gray-800/50 text-gray-400 border-gray-700/50 hover:border-gray-600/50'
          }`}
          onClick={() => onChange(level.value)}
        >
          {level.label}
        </button>
      ))}
    </div>
  );
};
