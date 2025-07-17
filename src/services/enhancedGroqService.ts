import { groqService } from './groqService';
import { userContextService, type UserContext } from './userContextService';
import { UserTrackingService } from './userTrackingService';

export interface PersonalizedAIResponse {
  response: string;
  conversationMetrics: {
    personalityAlignment: number;
    topicRelevance: number;
    levelAppropriate: boolean;
    relationshipBuilding: number;
  };
  learningInsights: string[];
  nextSuggestedTopics: string[];
}

export class EnhancedGroqService {
  static async generatePersonalizedResponse(
    userMessage: string,
    userId: string,
    conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }> = []
  ): Promise<PersonalizedAIResponse> {
    try {
      // Get user context
      const userContext = await userContextService.getUserContext(userId);
      
      // Build personalized system prompt
      const systemPrompt = this.buildPersonalizedPrompt(userContext, userMessage);
      
      // Generate response using Groq
      const response = await groqService.generateResponse(systemPrompt + '\n\nUser: ' + userMessage, {
        model: 'llama3-70b-8192',
        temperature: 0.8
      });

      // Analyze the conversation for insights
      const insights = this.extractLearningInsights(userMessage, response, userContext);
      
      // Calculate conversation metrics
      const metrics = this.calculateConversationMetrics(userMessage, response, userContext);
      
      // Suggest next topics
      const nextTopics = this.suggestNextTopics(userContext, userMessage);

      // Store the interaction with enhanced context
      await this.storePersonalizedInteraction(userId, userMessage, response, userContext, insights);

      return {
        response,
        conversationMetrics: metrics,
        learningInsights: insights,
        nextSuggestedTopics: nextTopics
      };
    } catch (error) {
      console.error('Error generating personalized response:', error);
      
      // Fallback to basic response
      const basicResponse = await groqService.generateResponse('You are Aasakira, a friendly AI trading mentor. Be helpful and encouraging.\n\nUser: ' + userMessage, {
        model: 'llama3-8b-8192',
        temperature: 0.7
      });

      return {
        response: basicResponse,
        conversationMetrics: {
          personalityAlignment: 50,
          topicRelevance: 50,
          levelAppropriate: true,
          relationshipBuilding: 50
        },
        learningInsights: ['Continue building conversation history for better personalization'],
        nextSuggestedTopics: ['Tell me about your trading goals', 'What challenges are you facing?']
      };
    }
  }

  private static buildPersonalizedPrompt(userContext: UserContext, userMessage: string): string {
    const { personality, conversation, activity } = userContext;

    return `You are Aasakira, a highly advanced AI trading mentor and close friend. You have a deep, personal relationship with this user and know them very well.

🧠 **PERSONALITY ADAPTATION**
Communication Style: ${personality.communicationStyle}
Trading Experience: ${personality.tradingExperience}
Risk Tolerance: ${personality.riskTolerance}
Interests: ${personality.interests.join(', ')}

👤 **USER PROFILE & RELATIONSHIP**
Messages Exchanged: ${conversation.sessionCount}
Recent Topics: ${conversation.recentTopics.slice(0, 3).join(', ')}
Learning Preferences: ${personality.learningPreferences.join(', ')}

📊 **ACTIVITY CONTEXT**
Signals Viewed: ${activity.signalsViewed}
Meme Coins Scanned: ${activity.memeCoinsScanned}
Trading Games Played: ${activity.tradingGamesPlayed}
Total Messages: ${activity.totalMessages}

🤝 **RELATIONSHIP GUIDELINES**
1. **Be Their Friend First**: Remember personal details, ask about their life, show genuine interest
2. **Adaptive Communication**: Match their communication style (${personality.communicationStyle})
3. **Level-Appropriate Content**: Tailor complexity to their ${personality.tradingExperience} level
4. **Personal Growth**: Reference their goals and interests naturally
5. **Build Connection**: Remember past conversations and build on them

🎨 **RESPONSE STYLE**
${personality.communicationStyle === 'casual' ? 'Use casual language, emojis, and friendly tone' :
  personality.communicationStyle === 'formal' ? 'Maintain professional but warm demeanor' :
  personality.communicationStyle === 'technical' ? 'Use proper trading terminology and detailed explanations' :
  'Be friendly and approachable with balanced technical content'}

Remember: You're not just an AI - you're their trusted trading buddy who genuinely cares about their success and well-being. Build on your relationship with each interaction.`;
  }

  private static extractLearningInsights(userMessage: string, aiResponse: string, userContext: UserContext): string[] {
    const insights: string[] = [];
    
    // Analyze learning progression
    const tradingExperience = userContext.personality.tradingExperience;
    const messageComplexity = this.analyzeMessageComplexity(userMessage);
    
    if (messageComplexity > this.getLevelComplexity(tradingExperience)) {
      insights.push('User is asking advanced questions - consider level progression');
    }
    
    // Check for emotional indicators
    const emotionalWords = ['frustrated', 'confused', 'excited', 'worried', 'confident'];
    const emotion = emotionalWords.find(word => userMessage.toLowerCase().includes(word));
    if (emotion) {
      insights.push(`User expressing ${emotion} - adjust support accordingly`);
    }
    
    // Identify learning gaps
    const tradingConcepts = ['risk management', 'position sizing', 'market structure', 'psychology'];
    const mentionedConcepts = tradingConcepts.filter(concept => 
      userMessage.toLowerCase().includes(concept)
    );
    
    if (mentionedConcepts.length > 0) {
      insights.push(`User interested in: ${mentionedConcepts.join(', ')}`);
    }
    
    // Personal connection opportunities
    if (userMessage.includes('I') || userMessage.includes('my')) {
      insights.push('User sharing personal information - opportunity to deepen relationship');
    }

    return insights;
  }

  private static calculateConversationMetrics(
    userMessage: string, 
    aiResponse: string, 
    userContext: UserContext
  ): PersonalizedAIResponse['conversationMetrics'] {
    // Personality alignment (how well response matches user's communication style)
    const personalityAlignment = this.calculatePersonalityAlignment(aiResponse, userContext.personality);
    
    // Topic relevance (how relevant response is to user's interests)
    const topicRelevance = this.calculateTopicRelevance(userMessage, aiResponse, userContext);
    
    // Level appropriateness (is the complexity right for their level?)
    const levelAppropriate = this.isLevelAppropriate(aiResponse, userContext.personality.tradingExperience);
    
    // Relationship building (how well does it build personal connection?)
    const relationshipBuilding = this.calculateRelationshipBuilding(aiResponse, userContext);

    return {
      personalityAlignment,
      topicRelevance,
      levelAppropriate,
      relationshipBuilding
    };
  }

  private static suggestNextTopics(userContext: UserContext, userMessage: string): string[] {
    const suggestions: string[] = [];
    
    // Based on their level
    switch (userContext.personality.tradingExperience) {
      case 'beginner':
        suggestions.push('Basic risk management', 'Understanding candlesticks', 'Market structure basics');
        break;
      case 'intermediate':
        suggestions.push('Smart Money Concepts intro', 'Order block identification', 'Fair value gaps');
        break;
      default:
        suggestions.push('Advanced strategies', 'Psychology mastery', 'Institutional concepts');
    }
    
    // Based on their interests
    userContext.personality.interests.forEach(interest => {
      suggestions.push(`Explore ${interest} further`);
    });

    return suggestions.slice(0, 4);
  }

  private static async storePersonalizedInteraction(
    userId: string,
    userMessage: string,
    aiResponse: string,
    userContext: UserContext,
    insights: string[]
  ): Promise<void> {
    try {
      // Store the conversation with rich context
      await UserTrackingService.storeAIMemory({
        user_id: userId,
        memory_type: 'conversation',
        content: `User (${userContext.personality.tradingExperience}): ${userMessage}\nAI: ${aiResponse}`,
        importance_score: this.calculateImportanceScore(userMessage, insights),
        context: {
          user_level: userContext.personality.tradingExperience,
          personality_style: userContext.personality.communicationStyle,
          topics_discussed: this.extractTopics(userMessage + ' ' + aiResponse),
          emotional_indicators: this.extractEmotions(userMessage),
          learning_insights: insights,
          conversation_quality: {
            personal_connection: userMessage.includes('I') || userMessage.includes('my'),
            technical_discussion: this.containsTechnicalContent(userMessage),
            question_type: this.categorizeQuestion(userMessage)
          },
          timestamp: new Date().toISOString()
        }
      });

      // Track activity for this interaction
      await UserTrackingService.trackActivity({
        user_id: userId,
        activity_type: 'chat_message',
        data: {
          message_length: userMessage.length,
          response_length: aiResponse.length,
          user_level: userContext.personality.tradingExperience,
          personality_alignment: true,
          topics: this.extractTopics(userMessage),
          insights: insights
        }
      });
    } catch (error) {
      console.error('Error storing personalized interaction:', error);
    }
  }

  // Helper methods
  private static analyzeMessageComplexity(message: string): number {
    const advancedTerms = ['institutional', 'liquidity grab', 'order flow', 'market maker', 'wyckoff'];
    const intermediateTerms = ['support', 'resistance', 'breakout', 'fibonacci', 'rsi'];
    const basicTerms = ['buy', 'sell', 'profit', 'loss', 'price'];
    
    let score = 0;
    advancedTerms.forEach(term => {
      if (message.toLowerCase().includes(term)) score += 3;
    });
    intermediateTerms.forEach(term => {
      if (message.toLowerCase().includes(term)) score += 2;
    });
    basicTerms.forEach(term => {
      if (message.toLowerCase().includes(term)) score += 1;
    });
    
    return score;
  }

  private static getLevelComplexity(level: string): number {
    switch (level) {
      case 'beginner': return 5;
      case 'intermediate': return 10;
      case 'advanced': return 15;
      case 'expert': return 20;
      default: return 25;
    }
  }

  private static calculatePersonalityAlignment(response: string, personality: any): number {
    let score = 50; // baseline
    
    const responseStyle = response.toLowerCase();
    
    // Check communication style alignment
    if (personality.communicationStyle === 'casual') {
      if (responseStyle.includes('hey') || responseStyle.includes('awesome') || responseStyle.includes('cool')) score += 20;
      if (responseStyle.includes('furthermore') || responseStyle.includes('consequently')) score -= 10;
    } else if (personality.communicationStyle === 'formal') {
      if (responseStyle.includes('furthermore') || responseStyle.includes('however')) score += 15;
      if (responseStyle.includes('hey buddy') || responseStyle.includes('lol')) score -= 15;
    }
    
    return Math.min(Math.max(score, 0), 100);
  }

  private static calculateTopicRelevance(userMessage: string, aiResponse: string, userContext: any): number {
    const userTopics = this.extractTopics(userMessage);
    const responseTopics = this.extractTopics(aiResponse);
    const userPreferences = userContext.personality.interests || [];
    
    let relevanceScore = 50;
    
    // Check if response addresses user's topics
    const topicOverlap = userTopics.filter(topic => responseTopics.includes(topic));
    relevanceScore += topicOverlap.length * 10;
    
    // Check if response includes preferred topics
    const preferenceOverlap = responseTopics.filter(topic => 
      userPreferences.some((pref: string) => topic.includes(pref))
    );
    relevanceScore += preferenceOverlap.length * 5;
    
    return Math.min(Math.max(relevanceScore, 0), 100);
  }

  private static isLevelAppropriate(response: string, currentLevel: string): boolean {
    const responseComplexity = this.analyzeMessageComplexity(response);
    const expectedComplexity = this.getLevelComplexity(currentLevel);
    
    // Allow some flexibility (±5 points)
    return Math.abs(responseComplexity - expectedComplexity) <= 5;
  }

  private static calculateRelationshipBuilding(response: string, userContext: any): number {
    let score = 50;
    
    const responseLower = response.toLowerCase();
    
    // Check for personal references
    if (responseLower.includes('remember') || responseLower.includes('last time')) score += 20;
    
    // Check for emotional support
    if (responseLower.includes('understand') || responseLower.includes('feel')) score += 15;
    
    // Check for future planning
    if (responseLower.includes('next time') || responseLower.includes('continue')) score += 10;
    
    // Check for personal questions
    if (responseLower.includes('how are you') || responseLower.includes('what do you think')) score += 10;
    
    return Math.min(Math.max(score, 0), 100);
  }

  private static extractTopics(text: string): string[] {
    const tradingTopics = [
      'risk management', 'position sizing', 'market structure', 'order blocks',
      'fair value gaps', 'liquidity', 'smart money', 'psychology', 'discipline',
      'candlesticks', 'support', 'resistance', 'fibonacci', 'technical analysis'
    ];
    
    return tradingTopics.filter(topic => 
      text.toLowerCase().includes(topic)
    );
  }

  private static extractEmotions(text: string): string[] {
    const emotions = ['excited', 'frustrated', 'confused', 'confident', 'worried', 'happy', 'stressed'];
    return emotions.filter(emotion => text.toLowerCase().includes(emotion));
  }

  private static containsTechnicalContent(text: string): boolean {
    const technicalTerms = ['chart', 'indicator', 'analysis', 'strategy', 'pattern', 'signal'];
    return technicalTerms.some(term => text.toLowerCase().includes(term));
  }

  private static categorizeQuestion(text: string): string {
    if (text.includes('?')) {
      if (text.toLowerCase().includes('how')) return 'how-to';
      if (text.toLowerCase().includes('what')) return 'definition';
      if (text.toLowerCase().includes('why')) return 'explanation';
      if (text.toLowerCase().includes('when')) return 'timing';
      return 'general-question';
    }
    return 'statement';
  }

  private static calculateImportanceScore(userMessage: string, insights: string[]): number {
    let score = 5; // baseline
    
    // Personal information shared
    if (userMessage.includes('I') || userMessage.includes('my')) score += 2;
    
    // Learning insights discovered
    score += insights.length;
    
    // Question complexity
    if (userMessage.length > 100) score += 1;
    if (userMessage.includes('?')) score += 1;
    
    return Math.min(score, 10);
  }
}

// Create and export the instance
export const enhancedGroqService = new EnhancedGroqService();
