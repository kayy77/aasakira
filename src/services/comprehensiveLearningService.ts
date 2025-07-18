
import { groqService } from '@/services/groqService';

export interface LearningMission {
  id: string;
  title: string;
  description: string;
  content: string;
  stage: number;
  week: number;
  estimatedTime: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  prerequisites: string[];
  learningObjectives: string[];
  keyPoints: string[];
  practicalExercises: string[];
  quiz: QuizQuestion[];
  completed: boolean;
  score?: number;
  mentorPrompt: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface LearningStage {
  id: number;
  title: string;
  description: string;
  duration: string;
  missions: LearningMission[];
  completed: boolean;
  progress: number;
}

export interface UserLearningProgress {
  userId: string;
  currentStage: number;
  currentMission: number;
  completedMissions: string[];
  totalTimeSpent: number;
  lastActive: string;
  strengths: string[];
  weaknesses: string[];
  overallProgress: number;
}

class ComprehensiveLearningService {
  private learningPath: LearningStage[] = [
    // STAGE 1: Absolute Basics (Week 1)
    {
      id: 1,
      title: "Trading Foundations",
      description: "Master the absolute basics - what trading really is",
      duration: "1 Week",
      missions: [
        {
          id: "1-1",
          title: "What Actually Is Trading?",
          description: "Understand the fundamental concept of trading and financial markets",
          content: "",
          stage: 1,
          week: 1,
          estimatedTime: "45 minutes",
          difficulty: "Beginner",
          prerequisites: [],
          learningObjectives: [
            "Define what trading means",
            "Understand buying and selling concepts",
            "Recognize different types of financial markets"
          ],
          keyPoints: [
            "Trading is exchanging one asset for another",
            "Profit comes from price differences",
            "Markets exist for stocks, forex, crypto, commodities"
          ],
          practicalExercises: [
            "Identify 5 different financial markets",
            "Explain trading in your own words"
          ],
          quiz: [],
          completed: false,
          mentorPrompt: "I'm learning about what trading actually is. Can you help me understand the basic concept and why people trade?"
        },
        {
          id: "1-2",
          title: "What Is Forex?",
          description: "Deep dive into the foreign exchange market",
          content: "",
          stage: 1,
          week: 1,
          estimatedTime: "60 minutes",
          difficulty: "Beginner",
          prerequisites: ["1-1"],
          learningObjectives: [
            "Define forex and currency trading",
            "Understand why currencies are traded",
            "Learn about the global forex market"
          ],
          keyPoints: [
            "Forex = Foreign Exchange",
            "Largest financial market in the world",
            "Trading currencies in pairs",
            "$6.6 trillion daily volume"
          ],
          practicalExercises: [
            "List 10 major world currencies",
            "Explain why EUR/USD is the most traded pair"
          ],
          quiz: [],
          completed: false,
          mentorPrompt: "I'm learning about forex trading. Can you explain how the foreign exchange market works and why it's so popular?"
        }
      ],
      completed: false,
      progress: 0
    },
    
    // STAGE 2: Basic Terminology (Week 1-2)
    {
      id: 2,
      title: "Essential Trading Terms",
      description: "Master pips, spreads, leverage, and lot sizes",
      duration: "1 Week",
      missions: [
        {
          id: "2-1",
          title: "Pips & Spreads",
          description: "Understand the smallest price movements and trading costs",
          content: "",
          stage: 2,
          week: 1,
          estimatedTime: "90 minutes",
          difficulty: "Beginner",
          prerequisites: ["1-2"],
          learningObjectives: [
            "Define what a pip is",
            "Calculate pip values",
            "Understand bid/ask spreads"
          ],
          keyPoints: [
            "Pip = smallest price movement",
            "Usually 4th decimal place",
            "Spread = difference between bid and ask",
            "Tighter spreads = lower cost"
          ],
          practicalExercises: [
            "Calculate pip value for EUR/USD",
            "Compare spreads across different brokers"
          ],
          quiz: [],
          completed: false,
          mentorPrompt: "I'm learning about pips and spreads. Can you help me understand how to calculate pip values and why spreads matter?"
        }
      ],
      completed: false,
      progress: 0
    }
  ];

  async generateMissionContent(mission: LearningMission): Promise<string> {
    const prompt = `Generate comprehensive educational content for a forex trading lesson.

Mission: ${mission.title}
Description: ${mission.description}
Difficulty: ${mission.difficulty}
Estimated Time: ${mission.estimatedTime}

Learning Objectives:
${mission.learningObjectives.map(obj => `- ${obj}`).join('\n')}

Key Points to Cover:
${mission.keyPoints.map(point => `- ${point}`).join('\n')}

Create detailed, engaging content that:
1. Starts with a hook to grab attention
2. Explains concepts with real-world examples
3. Uses analogies where helpful
4. Includes practical tips
5. Emphasizes the importance of understanding this concept
6. Ends with encouragement to take notes and really master this

Make it conversational but professional. This is for someone who may be completely new to trading.

Content should be 800-1200 words.`;

    try {
      const content = await groqService.generateResponse(prompt, {
        model: 'llama3-8b-8192',
        temperature: 0.3,
        max_tokens: 1500
      });
      return content;
    } catch (error) {
      console.error('Error generating mission content:', error);
      return `# ${mission.title}\n\n${mission.description}\n\nContent is being generated...`;
    }
  }

  async generateQuiz(mission: LearningMission): Promise<QuizQuestion[]> {
    const prompt = `Create a 5-question multiple choice quiz for this forex trading lesson:

Mission: ${mission.title}
Key Points: ${mission.keyPoints.join(', ')}
Learning Objectives: ${mission.learningObjectives.join(', ')}

Generate exactly 5 questions that test understanding of the core concepts.
Each question should have 4 options (A, B, C, D) with only one correct answer.
Include explanations for why the correct answer is right.

Format as JSON:
[
  {
    "question": "What is a pip in forex trading?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": 0,
    "explanation": "Explanation of why this is correct"
  }
]`;

    try {
      const response = await groqService.generateResponse(prompt, {
        model: 'llama3-8b-8192',
        temperature: 0.2,
        max_tokens: 1000
      });
      
      const quiz = JSON.parse(response);
      return quiz.map((q: any, index: number) => ({
        id: `${mission.id}-q${index + 1}`,
        ...q
      }));
    } catch (error) {
      console.error('Error generating quiz:', error);
      return [];
    }
  }

  async getFullLearningPath(): Promise<LearningStage[]> {
    // Generate all 6 stages with comprehensive content
    const stages = await this.generateCompleteLearningPath();
    return stages;
  }

  private async generateCompleteLearningPath(): Promise<LearningStage[]> {
    const stageTemplates = [
      {
        id: 1,
        title: "Trading Foundations",
        description: "Master the absolute basics - what trading really is",
        duration: "1 Week",
        topics: [
          "What Actually Is Trading?",
          "What Is Forex?",
          "Why Do People Trade?",
          "Understanding Financial Markets"
        ]
      },
      {
        id: 2,
        title: "Essential Trading Terms",
        description: "Master pips, spreads, leverage, and lot sizes",
        duration: "1 Week",
        topics: [
          "Pips & Spreads",
          "Leverage & Margin",
          "Lot Sizes",
          "What Is A Broker?",
          "How Brokers Work"
        ]
      },
      {
        id: 3,
        title: "Market Sessions & Currency Pairs",
        description: "Learn trading sessions and currency classifications",
        duration: "1 Week",
        topics: [
          "London Session",
          "New York Session", 
          "Asian Session",
          "Major Currency Pairs",
          "Minor & Exotic Pairs",
          "Best Times to Trade"
        ]
      },
      {
        id: 4,
        title: "Technical Analysis Fundamentals",
        description: "Master candlesticks, support/resistance, and market structure",
        duration: "2-3 Weeks",
        topics: [
          "Candlestick Patterns",
          "Engulfing Patterns",
          "Doji & Hammer Candles",
          "Support & Resistance",
          "Market Structure",
          "Higher Highs & Lower Lows",
          "Break of Structure"
        ]
      },
      {
        id: 5,
        title: "Smart Money Concepts",
        description: "Learn institutional trading concepts and indicators",
        duration: "2-3 Weeks",
        topics: [
          "Liquidity Grabs",
          "Order Blocks",
          "Fair Value Gaps (FVGs)",
          "RSI Basics",
          "MACD Understanding",
          "Volume Analysis",
          "Using Indicators as Confirmation"
        ]
      },
      {
        id: 6,
        title: "Trading Psychology & Risk Management",
        description: "Master the mental game and protect your capital",
        duration: "2 Weeks",
        topics: [
          "Risk Management Rules",
          "1-2% Risk Rule",
          "Never Revenge Trade",
          "Accepting Losses",
          "Building Trading Discipline",
          "Using Our Trading Journal",
          "Psychology of Winning"
        ]
      },
      {
        id: 7,
        title: "Strategy Development",
        description: "Choose and master your trading framework",
        duration: "3-4 Weeks",
        topics: [
          "SMC + Confirmation Strategy",
          "Break & Retest Method",
          "Liquidity Sweeps + Order Blocks",
          "Building Your System",
          "Backtesting Your Strategy",
          "Strategy Optimization"
        ]
      },
      {
        id: 8,
        title: "Demo Trading Practice",
        description: "Test your skills with demo accounts and our signals",
        duration: "4-6 Weeks",
        topics: [
          "Setting Up MetaTrader 4/5",
          "Demo Account Basics",
          "Following Our Signals",
          "Practicing Your Strategy",
          "Tracking Demo Performance",
          "Learning from Mistakes"
        ]
      },
      {
        id: 9,
        title: "Funded Account Preparation",
        description: "Understand funded accounts and professional trading",
        duration: "2-3 Weeks",
        topics: [
          "What Are Funded Accounts?",
          "Benefits of Funded Trading",
          "FTMO, MyForexFunds Overview",
          "Challenge Requirements",
          "Preparing for Evaluation",
          "Professional Trading Mindset"
        ]
      },
      {
        id: 10,
        title: "Advanced Trading Mastery",
        description: "Perfect your strategy and maintain discipline",
        duration: "Ongoing",
        topics: [
          "Advanced Psychology",
          "Sticking to Your Strategy",
          "Never Revenge Trading",
          "Continuous Improvement",
          "AI Mentor Guidance",
          "Professional Development"
        ]
      }
    ];

    const stages: LearningStage[] = [];

    for (const template of stageTemplates) {
      const missions: LearningMission[] = [];
      
      for (let i = 0; i < template.topics.length; i++) {
        const topic = template.topics[i];
        const mission: LearningMission = {
          id: `${template.id}-${i + 1}`,
          title: topic,
          description: `Master ${topic.toLowerCase()} concepts`,
          content: "",
          stage: template.id,
          week: Math.ceil((i + 1) / 2),
          estimatedTime: template.id <= 3 ? "45-60 minutes" : template.id <= 6 ? "90-120 minutes" : "60-90 minutes",
          difficulty: template.id <= 3 ? "Beginner" : template.id <= 6 ? "Intermediate" : "Advanced",
          prerequisites: i === 0 ? (template.id === 1 ? [] : [`${template.id - 1}-${stageTemplates[template.id - 2].topics.length}`]) : [`${template.id}-${i}`],
          learningObjectives: [],
          keyPoints: [],
          practicalExercises: [],
          quiz: [],
          completed: false,
          mentorPrompt: `I'm learning about ${topic}. Can you help me understand this concept better and answer any questions I have?`
        };
        
        missions.push(mission);
      }

      stages.push({
        id: template.id,
        title: template.title,
        description: template.description,
        duration: template.duration,
        missions,
        completed: false,
        progress: 0
      });
    }

    return stages;
  }

  async getUserProgress(userId: string): Promise<UserLearningProgress> {
    // In real implementation, load from database
    return {
      userId,
      currentStage: 1,
      currentMission: 1,
      completedMissions: [],
      totalTimeSpent: 0,
      lastActive: new Date().toISOString(),
      strengths: [],
      weaknesses: [],
      overallProgress: 0
    };
  }

  async updateUserProgress(userId: string, missionId: string, score: number): Promise<void> {
    // Update user progress in database
    console.log(`Updating progress for user ${userId}, mission ${missionId}, score ${score}`);
  }

  async generatePersonalizedFeedback(userId: string, missionId: string, score: number): Promise<string> {
    const prompt = `Generate personalized feedback for a trading student.

Mission ID: ${missionId}
Score: ${score}/100
User ID: ${userId}

Based on the score, provide:
1. Congratulations if score > 80
2. Encouragement if score 60-80
3. Motivational advice if score < 60
4. Specific areas to review
5. Next steps
6. Remember: "You will not get rich quick. But you will get rich if you're obsessed with improving."

Keep it encouraging, personal, and actionable. Limit to 200 words.`;

    try {
      const feedback = await groqService.generateResponse(prompt, {
        model: 'llama3-8b-8192',
        temperature: 0.4,
        max_tokens: 300
      });
      return feedback;
    } catch (error) {
      console.error('Error generating feedback:', error);
      return "Great work on completing this mission! Keep practicing and reviewing the material. Remember, mastery comes through consistent effort and obsessing over improvement!";
    }
  }
}

export const comprehensiveLearningService = new ComprehensiveLearningService();
