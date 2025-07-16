import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { multiIntelligenceCore, SignalDNA } from '@/services/multiIntelligenceCore';
import { webhookService } from '@/services/webhookService';
import { trueLivePriceService } from '@/services/trueLivePriceService';
import { supabase } from '@/integrations/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import SignalCardV2 from './SignalCardV2';
import EnhancedTacticalParameters from './EnhancedTacticalParameters';
import StrategyBreakdownModal from './StrategyBreakdownModal';
import WebhookManager from './WebhookManager';
import SignalMemoryDashboard from './SignalMemoryDashboard';
import AutoJournalModal from './AutoJournalModal';
import ABTestingFramework from './ABTestingFramework';
import AISignalDigest from './AISignalDigest';
import ShareableSignalCard from './ShareableSignalCard';
import { 
  Brain, 
  Activity, 
  Clock, 
  RefreshCw,
  Webhook,
  CheckCircle2,
  Target,
  Shield,
  AlertTriangle,
  Info,
  Crown,
  Lock,
  TrendingUp,
  BookOpen,
  FlaskConical,
  FileText,
  Share2,
  Mail
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useSubscription } from '@/contexts
