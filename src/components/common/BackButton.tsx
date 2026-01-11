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

  const handleBack = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Robust back behavior:
    // 1) Attempt browser back
    // 2) If URL doesn't change (common when opened directly / in embedded contexts), fallback to a safe route
    const currentHref = window.location.href;
    navigate(-1);

    window.setTimeout(() => {
      if (window.location.href === currentHref) {
        navigate(fallbackPath, { replace: true });
      }
    }, 150);
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
