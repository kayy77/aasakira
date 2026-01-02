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
    // Check if there's history to go back to
    if (window.history.length > 2) {
      navigate(-1);
    } else {
      // No history, go to fallback (home)
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
