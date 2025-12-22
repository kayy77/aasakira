
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BackButtonProps {
  className?: string;
}

export default function BackButton({ className = '' }: BackButtonProps) {
  const navigate = useNavigate();

  return (
    <Button
      onClick={() => navigate(-1)}
      variant="ghost"
      className={`flex items-center gap-2 text-muted-foreground hover:text-foreground hover:bg-accent/40 ${className}`}
    >
      <ArrowLeft className="w-4 h-4" />
      Back
    </Button>
  );
}
