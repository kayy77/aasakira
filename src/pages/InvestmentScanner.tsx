
import React from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, BarChart3, Search, Instagram } from 'lucide-react';

export default function InvestmentScanner() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navigation */}
      <nav className="p-6">
        <Link to="/" className="text-pink-400 hover:text-pink-300 transition">
          ← Back to Dashboard
        </Link>
      </nav>

      {/* Hero Section */}
      <div className="flex flex-col items-center justify-center min-h-[80vh] text-center p-6">
        <div className="mb-8">
          <BarChart3 className="w-20 h-20 text-pink-400 mx-auto mb-4" />
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
            AI Investment Scanner
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl">
            Long-term investment, redefined. We're creating an AI that scans the crypto and stock markets to detect undervalued assets, breakout opportunities, and strong long holds.
          </p>
        </div>

        {/* Features Preview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 max-w-4xl">
          <div className="bg-gray-900 p-6 rounded-xl border border-pink-500/30">
            <Search className="w-8 h-8 text-pink-400 mb-3" />
            <h3 className="text-lg font-semibold mb-2">Deep Market Analysis</h3>
            <p className="text-gray-400 text-sm">AI scans fundamentals, technicals, and sentiment</p>
          </div>
          <div className="bg-gray-900 p-6 rounded-xl border border-pink-500/30">
            <TrendingUp className="w-8 h-8 text-pink-400 mb-3" />
            <h3 className="text-lg font-semibold mb-2">Breakout Detection</h3>
            <p className="text-gray-400 text-sm">Identify assets before major price movements</p>
          </div>
          <div className="bg-gray-900 p-6 rounded-xl border border-pink-500/30">
            <BarChart3 className="w-8 h-8 text-pink-400 mb-3" />
            <h3 className="text-lg font-semibold mb-2">Portfolio Optimization</h3>
            <p className="text-gray-400 text-sm">Smart diversification and risk management</p>
          </div>
        </div>

        {/* CTA */}
        <div className="space-y-4">
          <a
            href="https://instagram.com/aasakira.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 rounded-xl text-white text-lg font-semibold transition-all transform hover:scale-105"
          >
            <Instagram className="w-5 h-5" />
            Be First to Use It
          </a>
          <p className="text-gray-400 text-sm">Follow us on Instagram for early access</p>
        </div>
      </div>
    </div>
  );
}
