
import React from 'react';
import { Link } from 'react-router-dom';
import BackButton from '@/components/common/BackButton';

export default function BetScanner() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white">
      <div className="container mx-auto px-4 py-8">
        <BackButton className="mb-6" />
        
        <div className="flex flex-col items-center justify-center min-h-[80vh] text-center">
          <div className="mb-8">
            <h1 className="text-5xl font-bold mb-4 gradient-text">⚡ AI Bet Scanner</h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
              We're building the most advanced AI bet analyzer — built to scan probabilities, 
              odds movement, momentum, and sentiment so you get an unfair edge in betting.
            </p>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 max-w-md mx-auto border border-gray-700">
            <h3 className="text-2xl font-semibold mb-4 text-pink-400">Coming Soon</h3>
            <p className="text-gray-300 mb-6">
              Advanced probability analysis, real-time odds tracking, and smart money detection 
              for sports betting.
            </p>
            
            <Link
              to="https://instagram.com/aasakira.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block w-full px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 rounded-xl text-white font-semibold transition-all duration-200 transform hover:scale-105"
            >
              Be First to Use It
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
