
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useMentorMemory } from './MentorMemory';
import { Trophy, Target, TrendingUp, Brain } from 'lucide-react';

const ProgressChart = () => {
  const { userProgress } = useMentorMemory();

  // Mock progress data over time
  const progressData = [
    { week: 'Week 1', score: 20 },
    { week: 'Week 2', score: 35 },
    { week: 'Week 3', score: 45 },
    { week: 'Week 4', score: 60 },
    { week: 'Week 5', score: 75 },
    { week: 'Week 6', score: 85 },
  ];

  // Skills breakdown
  const skillsData = [
    { name: 'Technical Analysis', value: 80, color: '#8b5cf6' },
    { name: 'Risk Management', value: 65, color: '#06d6a0' },
    { name: 'Psychology', value: 45, color: '#f72585' },
    { name: 'Strategy', value: 70, color: '#ffbe0b' },
  ];

  const getLevelProgress = () => {
    const levels = ['Beginner', 'Intermediate', 'Advanced'];
    const currentIndex = levels.indexOf(userProgress.level);
    return ((currentIndex + 1) / levels.length) * 100;
  };

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="glass-card border-purple-500/20">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Trophy className="w-5 h-5 text-yellow-400" />
              <div>
                <p className="text-sm text-gray-400">Level</p>
                <p className="text-lg font-bold text-white">{userProgress.level}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-green-500/20">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Target className="w-5 h-5 text-green-400" />
              <div>
                <p className="text-sm text-gray-400">Lessons</p>
                <p className="text-lg font-bold text-white">{userProgress.completedLessons.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-blue-500/20">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-blue-400" />
              <div>
                <p className="text-sm text-gray-400">Progress</p>
                <p className="text-lg font-bold text-white">{getLevelProgress().toFixed(0)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-pink-500/20">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Brain className="w-5 h-5 text-pink-400" />
              <div>
                <p className="text-sm text-gray-400">Strengths</p>
                <p className="text-lg font-bold text-white">{userProgress.strengths.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Over Time */}
      <Card className="glass-card border-purple-500/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-purple-400" />
            Learning Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={progressData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="week" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1f2937', 
                  border: '1px solid #4b5563',
                  borderRadius: '8px'
                }}
              />
              <Line type="monotone" dataKey="score" stroke="#8b5cf6" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Skills Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="glass-card border-purple-500/20">
          <CardHeader>
            <CardTitle className="text-white">Skills Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={skillsData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                >
                  {skillsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {skillsData.map((skill, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: skill.color }}
                    ></div>
                    <span className="text-gray-300 text-sm">{skill.name}</span>
                  </div>
                  <span className="text-white font-semibold">{skill.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-purple-500/20">
          <CardHeader>
            <CardTitle className="text-white">Your Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-gray-400 text-sm mb-2">Trading Style</p>
              <Badge variant="outline" className="border-purple-500 text-purple-300">
                {userProgress.tradingStyle || 'Not Set'}
              </Badge>
            </div>
            
            <div>
              <p className="text-gray-400 text-sm mb-2">Strengths</p>
              <div className="flex flex-wrap gap-2">
                {userProgress.strengths.length > 0 ? (
                  userProgress.strengths.map((strength, index) => (
                    <Badge key={index} variant="outline" className="border-green-500 text-green-300">
                      {strength}
                    </Badge>
                  ))
                ) : (
                  <span className="text-gray-500 text-sm">Complete assessments to identify strengths</span>
                )}
              </div>
            </div>

            <div>
              <p className="text-gray-400 text-sm mb-2">Areas to Improve</p>
              <div className="flex flex-wrap gap-2">
                {userProgress.weaknesses.length > 0 ? (
                  userProgress.weaknesses.map((weakness, index) => (
                    <Badge key={index} variant="outline" className="border-red-500 text-red-300">
                      {weakness}
                    </Badge>
                  ))
                ) : (
                  <span className="text-gray-500 text-sm">No weaknesses identified yet</span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProgressChart;
