
import React from 'react';
import Navigation from '@/components/Navigation';
import AIMentor from '@/components/education/AIMentor';
import FeatureGate from '@/components/FeatureGate';
import CherryBlossomBackground from '@/components/CherryBlossomBackground';

const Education = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900/20 to-black relative">
      <CherryBlossomBackground />
      <Navigation />
      
      <div className="relative z-10 pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold gradient-text mb-4">
              AI Trading Mentor
            </h1>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto">
              Learn from your personal AI trading mentor with advanced market knowledge and personalized guidance
            </p>
          </div>

          <FeatureGate feature="mentorMessages" featureName="AI Mentor Messages">
            <AIMentor />
          </FeatureGate>
        </div>
      </div>
    </div>
  );
};

export default Education;
