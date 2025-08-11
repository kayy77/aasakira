import React from 'react';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle, XCircle, Eye } from 'lucide-react';

interface SignalValidationStatusProps {
  status: 'APPROVED' | 'REJECTED' | 'WEAK' | 'PENDING' | 'PENDING_QA';
  rejectionReasons?: string[];
  className?: string;
}

export function SignalValidationStatus({ 
  status, 
  rejectionReasons = [], 
  className = "" 
}: SignalValidationStatusProps) {
  const getStatusConfig = () => {
    switch (status) {
      case 'APPROVED':
        return {
          icon: CheckCircle,
          color: 'bg-green-500/20 text-green-400 border-green-500/30',
          label: 'Approved'
        };
      case 'REJECTED':
        return {
          icon: XCircle,
          color: 'bg-red-500/20 text-red-400 border-red-500/30',
          label: 'Rejected'
        };
      case 'WEAK':
        return {
          icon: AlertTriangle,
          color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
          label: 'Weak (Admin Only)'
        };
      default:
        return {
          icon: Eye,
          color: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
          label: 'Pending'
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <div className={`space-y-2 ${className}`}>
      <Badge className={`${config.color} flex items-center gap-1`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
      
      {rejectionReasons.length > 0 && (
        <div className="text-xs text-red-400">
          <div className="font-semibold">Rejection reasons:</div>
          <ul className="list-disc list-inside">
            {rejectionReasons.map((reason, index) => (
              <li key={index}>{reason}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}