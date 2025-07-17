
import { useAuth } from '@/contexts/AuthContext';
import { UserTrackingService } from '@/services/userTrackingService';
import { useCallback } from 'react';

export const useUserTracking = () => {
  const { user } = useAuth();

  const trackEvent = useCallback(async (event: string, data: any) => {
    if (!user?.id) return;
    
    try {
      await UserTrackingService.trackUserEvent(user.id, event, {
        ...data,
        platform: 'aasakira',
        user_agent: navigator.userAgent,
        url: window.location.href,
        referrer: document.referrer
      });
    } catch (error) {
      console.error('Failed to track event:', error);
    }
  }, [user?.id]);

  const trackSignalInteraction = useCallback(async (signal: any, action: 'view' | 'skip' | 'copied' | 'screenshot') => {
    if (!user?.id) return;
    
    switch (action) {
      case 'view':
        await UserTrackingService.trackSignalView(user.id, signal);
        break;
      case 'skip':
        await UserTrackingService.trackSignalSkip(user.id, signal);
        break;
      case 'copied':
      case 'screenshot':
        await UserTrackingService.trackSignalAction(user.id, signal, action);
        break;
    }
  }, [user?.id]);

  const trackMentorInteraction = useCallback(async (prompt: string, context?: any) => {
    if (!user?.id) return;
    await UserTrackingService.trackMentorPrompt(user.id, prompt, context);
  }, [user?.id]);

  const trackEducationProgress = useCallback(async (module: string, timeSpent?: number) => {
    if (!user?.id) return;
    await UserTrackingService.trackEducationView(user.id, module, timeSpent);
  }, [user?.id]);

  const trackPageView = useCallback(async (page: string, additionalData?: any) => {
    if (!user?.id) return;
    
    await trackEvent('page_view', {
      page_name: page,
      timestamp: new Date().toISOString(),
      ...additionalData
    });
  }, [user?.id, trackEvent]);

  return {
    trackEvent,
    trackSignalInteraction,
    trackMentorInteraction,
    trackEducationProgress,
    trackPageView,
    userId: user?.id
  };
};
