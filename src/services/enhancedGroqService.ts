import { groqService } from './groqService';
import { UserTrackingService } from './userTrackingService';

export interface EnhancedGroqResponse {
  response: string;
  confidence: number;
  contextUsed: string[];
  personalizedInsights: string[];
}

class EnhancedGroqService {
  async generatePersonalizedResponse(
    userMessage: string,
    userId: string,
    conversationHistory: Array<{ role: string; content: string }> = [],
    userContext?: any
  ): Promise<EnhancedGroqResponse | null> {
    try {
      // Get comprehensive user behavior context if not provided
      const behaviorContext = userContext || await UserTrackingService.getUserBehaviorContext(userId);
      
      console.log('🧠 ENHANCED GROQ - User Context:', behaviorContext);

      // Build the enhanced system prompt with full user context
      const enhancedSystemPrompt = this.buildEliteSystemPrompt(behaviorContext);
      
      // Build conversation context
      const contextualPrompt = this.buildContextualPrompt(userMessage, behaviorContext, conversationHistory);
      
      console.log('🎯 GROQ REQUEST:', {
        promptLength: contextualPrompt.length,
        userSignalViews: behaviorContext?.behaviorPatterns?.signalEngagement?.totalViewed || 0,
        userSkipRate: behaviorContext?.behaviorPatterns?.signalEngagement?.skipRate || 0
      });

      const response = await groqService.generateResponse(contextualPrompt, {
        model: 'llama3-70b-8192',
        temperature: 0.4,
        max_tokens: 1500,
        systemPrompt: enhancedSystemPrompt
      });

      // Analyze the response quality and context usage
      const contextUsed = this.analyzeContextUsage(response, behaviorContext);
      const personalizedInsights = this.extractPersonalizedInsights(response, behaviorContext);

      console.log('✅ ENHANCED GROQ RESPONSE GENERATED:', {
        responseLength: response.length,
        contextUsed: contextUsed.length,
        insights: personalizedInsights.length
      });

      return {
        response,
        confidence: 85, // High confidence due to rich context
        contextUsed,
        personalizedInsights
      };

    } catch (error) {
      console.error('❌ Enhanced GROQ service error:', error);
      return null;
    }
  }

  private buildEliteSystemPrompt(userContext: any): string {
    const signalEngagement = userContext?.behaviorPatterns?.signalEngagement || {};
    const tradingHabits = userContext?.behaviorPatterns?.tradingHabits || {};
    const mentorInteraction = userContext?.behaviorPatterns?.mentorInteraction || {};

    return `You are Aasakira — elite AI trading strategist and mentor. No emojis. No fluff. Pure tactical precision.

🎯 MISSION: Train this trader to institutional-level performance through direct, uncompromising feedback.

👤 TRADER PROFILE:
- Signal Engagement: ${signalEngagement.totalViewed || 0} viewed, ${signalEngagement.skipRate || 0}% skip rate
- Preferred Pairs: ${signalEngagement.preferredPairs?.join(', ') || 'Unknown'}
- Confidence Threshold: ${signalEngagement.averageConfidenceThreshold || 'Unknown'}%
- Trading Style: ${tradingHabits.riskProfile || 'Unknown'}
- Active Time: ${tradingHabits.activeTimeOfDay || 'Unknown'}
- Framework Preference: ${tradingHabits.frameworkPreference?.join(', ') || 'None identified'}
- Mentor Interactions: ${mentorInteraction.totalPrompts || 0} sessions
- Common Topics: ${mentorInteraction.commonTopics?.join(', ') || 'General'}

🧠 PERSONALITY:
- Military precision, samurai discipline
- Call out weakness immediately based on their actual behavior
- Reference their specific patterns and mistakes
- Demand framework adherence
- Zero tolerance for poor risk management

🔍 RESPONSE REQUIREMENTS:
1. Reference their specific behavior patterns from the profile above
2. Call out framework violations immediately
3. Use their preferred pairs/timeframes in examples
4. Adjust aggression based on their experience level
5. Push them toward institutional thinking

❌ FORBIDDEN: Generic advice, emojis, sugar-coating weaknesses
✅ REQUIRED: Personal, tactical, behavior-driven coaching

Respond as Aasakira would to this specific trader.`;
  }

  private buildContextualPrompt(userMessage: string, userContext: any, conversationHistory: any[]): string {
    const recentActivities = userContext?.activities?.slice(0, 5) || [];
    const behaviorPatterns = userContext?.behaviorPatterns || {};
    
    let contextPrompt = `RECENT USER BEHAVIOR:\n`;
    
    // Add recent signal interactions
    const signalActivities = recentActivities.filter(a => a.activity_type === 'signal_view' || a.activity_type === 'signal_skip');
    if (signalActivities.length > 0) {
      contextPrompt += `Signal Activity:\n`;
      signalActivities.forEach(activity => {
        const action = activity.activity_type === 'signal_view' ? 'VIEWED' : 'SKIPPED';
        const confidence = activity.data.confidence || 'N/A';
        contextPrompt += `- ${action}: ${activity.data.pair} (${confidence}% confidence)\n`;
      });
    }

    // Add mentor interaction patterns
    if (behaviorPatterns.mentorInteraction?.commonTopics?.length > 0) {
      contextPrompt += `\nFrequent Questions: ${behaviorPatterns.mentorInteraction.commonTopics.join(', ')}\n`;
    }

    // Add conversation history
    if (conversationHistory.length > 0) {
      contextPrompt += `\nCONVERSATION HISTORY:\n`;
      conversationHistory.slice(-3).forEach(msg => {
        contextPrompt += `${msg.role}: ${msg.content.substring(0, 100)}...\n`;
      });
    }

    contextPrompt += `\nCURRENT MESSAGE: "${userMessage}"\n\n`;
    contextPrompt += `Provide elite-level coaching based on this specific trader's patterns and behavior.`;

    return contextPrompt;
  }

  private analyzeContextUsage(response: string, userContext: any): string[] {
    const contextUsed: string[] = [];
    const lowerResponse = response.toLowerCase();
    
    // Check if response references user's specific patterns
    const signalEngagement = userContext?.behaviorPatterns?.signalEngagement || {};
    
    if (signalEngagement.preferredPairs?.some((pair: string) => lowerResponse.includes(pair.toLowerCase()))) {
      contextUsed.push('User\'s preferred trading pairs');
    }
    
    if (lowerResponse.includes('skip') && signalEngagement.skipRate > 30) {
      contextUsed.push('User\'s high signal skip rate');
    }
    
    if (lowerResponse.includes('confidence') && signalEngagement.averageConfidenceThreshold) {
      contextUsed.push('User\'s confidence threshold patterns');
    }
    
    const tradingHabits = userContext?.behaviorPatterns?.tradingHabits || {};
    if (tradingHabits.activeTimeOfDay && lowerResponse.includes(tradingHabits.activeTimeOfDay.toLowerCase())) {
      contextUsed.push('User\'s trading time preferences');
    }
    
    return contextUsed;
  }

  private extractPersonalizedInsights(response: string, userContext: any): string[] {
    const insights: string[] = [];
    const lowerResponse = response.toLowerCase();
    
    // Extract insights based on response content
    if (lowerResponse.includes('pattern') || lowerResponse.includes('behavior')) {
      insights.push('Behavioral pattern analysis');
    }
    
    if (lowerResponse.includes('improvement') || lowerResponse.includes('better')) {
      insights.push('Performance improvement guidance');
    }
    
    if (lowerResponse.includes('risk') || lowerResponse.includes('management')) {
      insights.push('Risk management coaching');
    }
    
    if (lowerResponse.includes('discipline') || lowerResponse.includes('framework')) {
      insights.push('Trading discipline enhancement');
    }
    
    return insights;
  }

  async analyzeUserProgress(userId: string): Promise<any> {
    try {
      const userContext = await UserTrackingService.getUserBehaviorContext(userId);
      const progress = userContext?.progress;
      const patterns = userContext?.behaviorPatterns;
      
      if (!progress || !patterns) return null;
      
      const analysis = {
        strengths: [],
        weaknesses: [],
        recommendations: [],
        riskProfile: patterns.tradingHabits?.riskProfile || 'Unknown'
      };
      
      // Analyze strengths
      if (patterns.signalEngagement?.skipRate < 20) {
        analysis.strengths.push('Selective signal filtering');
      }
      
      if (patterns.signalEngagement?.averageConfidenceThreshold > 75) {
        analysis.strengths.push('High confidence standards');
      }
      
      // Analyze weaknesses
      if (patterns.signalEngagement?.skipRate > 60) {
        analysis.weaknesses.push('Over-selective, missing opportunities');
      }
      
      if (patterns.mentorInteraction?.totalPrompts > 20 && patterns.signalEngagement?.totalViewed < 10) {
        analysis.weaknesses.push('Theory-heavy, action-light');
      }
      
      // Generate recommendations
      if (analysis.weaknesses.includes('Over-selective, missing opportunities')) {
        analysis.recommendations.push('Lower confidence threshold to 65-70%');
      }
      
      return analysis;
    } catch (error) {
      console.error('Error analyzing user progress:', error);
      return null;
    }
  }
}

export const enhancedGroqService = new EnhancedGroqService();
