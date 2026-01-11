import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BackButtonProps {
  className?: string;
  fallbackPath?: string;
}

export default function BackButton({ className = '', fallbackPath = '/' }: BackButtonProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleBack = () => {
    // Always try to go back if there's any history
    // In SPAs, history.length is usually > 1 even on first load
    // We use state to track if we navigated from within the app
    if (window.history.state && window.history.state.idx > 0) {
      navigate(-1);
    } else {
      // No internal navigation history, go to fallback (home)
      navigate(fallbackPath);
    }
  };

  return (
    <Button
      onClick={handleBack}
      variant="ghost"
      className={`flex items-center gap-2 text-muted-foreground hover:text-foreground hover:bg-accent/40 ${className}`}
    >
      <ArrowLeft className="w-4 h-4" />
      Back
    </Button>
  );
}
