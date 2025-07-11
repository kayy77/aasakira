import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Index from '@/pages/Index';
import Signals from '@/pages/Signals';
import Education from '@/pages/Education';
import NotFound from '@/pages/NotFound';
import { Toaster } from "@/components/ui/toaster"

import MemeCoins from '@/pages/MemeCoins';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-black text-white">
        <Toaster />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/signals" element={<Signals />} />
          <Route path="/education" element={<Education />} />
          <Route path="/memecoins" element={<MemeCoins />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
