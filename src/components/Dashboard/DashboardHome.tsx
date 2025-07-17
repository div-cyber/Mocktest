import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useApp } from '../../contexts/AppContext';
import { 
  BookOpen, 
  FileText, 
  Trophy, 
  TrendingUp,
  Clock,
  Users,
  Target,
  Calendar,
  BarChart3,
  PieChart,
  Activity,
  Star,
  Zap,
  Brain,
  Timer
} from 'lucide-react';

const DashboardHome: React.FC = () => {
  const { user } = useAuth();
  const { mockTests, testResults, notes } = useApp();
  const [selectedTimeframe, setSelectedTimeframe] = useState<'week' | 'month' | 'year'>('week');

  const userTests = mockTests.filter(test => test.section === user?.section);
  const userResults = testResults.filter(result => result.userId === user?.id);
  const userNotes = notes.filter(note => note.section === user?.section);
  
  const averageScore = userResults.length > 0 
    ? Math.round(userResults.reduce((sum, result) => sum + result.score, 0) / userResults.length)
    : 0;

  const totalTestsTaken = userResults.length;
  const totalNotesRead = userNotes.length;
  const studyStreak = 7; // Mock data
  const totalStudyTime = userResults.reduce((sum, result) => sum + result.timeTaken, 0);

  // Performance analytics
  const getPerformanceTrend = () => {
    if (userResults.length < 2) return 0;
    const recent = userResults.slice(-3);
    const older = userResults.slice(-6, -3);
    const recentAvg = recent.reduce((sum, r) => sum + r.score, 0) / recent.length;
    const olderAvg = older.length > 0 ? older.reduce((sum, r) => sum + r.score, 0) / older.length : recentAvg;
    return recentAvg - olderAvg;
  };

  const performanceTrend = getPerformanceTrend();

  const stats = [
    {
      name: 'Tests Taken',
      value: totalTestsTaken,
      icon: Trophy,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
      change: '+12%',
      changeType: 'positive'
    },
    {
      name: 'Average Score',
      value: `${averageScore}%`,
      icon: Target,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
      change: performanceTrend > 0 ? `+${performanceTrend.toFixed(1)}%` : `${performanceTrend.toFixed(1)}%`,
      changeType: performanceTrend > 0 ? 'positive' : 'negative'
    },
    {
      name: 'Study Streak',
      value: `${studyStreak} days`,
      icon: Zap,
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-600',
      change: '+2 days',
      changeType: 'positive'
    },
    {
      name: 'Study Time',
      value: `${totalStudyTime}h`,
      icon: Clock,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600',
      change: '+5h',
      changeType: 'positive'
    }
  ];

  const recentTests = userResults.slice(-5).reverse();

  // Mock performance data for charts
  const weeklyPerformance = [
    { day: 'Mon', score: 75 },
    { day: 'Tue', score: 82 },
    { day: 'Wed', score: 78 },
    { day: 'Thu', score: 85 },
    { day: 'Fri', score: 88 },
    { day: 'Sat', score: 92 },
    { day: 'Sun', score: 89 }
  ];

  const subjectPerformance = [
    { subject: 'Mathematics', score: 85, tests: 5 },
    { subject: 'Physics', score: 78, tests: 3 },
    { subject: 'Chemistry', score: 92, tests: 4 },
    { subject: 'Biology', score: 88, tests: 2 }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-black rounded-xl shadow-lg text-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Hello, {user?.name}! 👋
            </h1>
            <p className="text-gray-300 text-lg">
              Ready to continue your {user?.section} studies?
            </p>
            <div className="mt-4 flex items-center space-x-4">
              <div className="flex items-center">
                <Zap className="h-5 w-5 mr-1" />
                <span className="text-sm">{studyStreak} day streak</span>
              </div>
              <div className="flex items-center">
                <Trophy className="h-5 w-5 mr-1" />
                <span className="text-sm">Level {Math.floor(totalTestsTaken / 3) + 1}</span>
              </div>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="w-24 h-24 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <BookOpen className="h-12 w-12 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`h-6 w-6 ${stat.textColor}`} />
                </div>
                <div className={`text-xs font-medium px-2 py-1 rounded-full ${
                  stat.changeType === 'positive' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {stat.change}
                </div>
              </div>
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Performance Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Performance Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 flex items-center">
              <BarChart3 className="h-5 w-5 mr-2 text-blue-500" />
              Weekly Performance
            </h2>
            <select
              value={selectedTimeframe}
              onChange={(e) => setSelectedTimeframe(e.target.value as 'week' | 'month' | 'year')}
              className="text-sm border border-gray-300 rounded-md px-2 py-1"
            >
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="year">This Year</option>
            </select>
          </div>
          <div className="space-y-3">
            {weeklyPerformance.map((day, index) => (
              <div key={day.day} className="flex items-center">
                <span className="w-8 text-sm text-gray-600">{day.day}</span>
                <div className="flex-1 mx-3 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-black h-2 rounded-full transition-all duration-500"
                    style={{ width: `${day.score}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium text-gray-900 w-8">{day.score}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Subject Performance */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <PieChart className="h-5 w-5 mr-2 text-green-500" />
            Subject Performance
          </h2>
          <div className="space-y-4">
            {subjectPerformance.map((subject, index) => (
              <div key={subject.subject} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full mr-3 ${
                    index === 0 ? 'bg-blue-500' : 
                    index === 1 ? 'bg-green-500' : 
                    index === 2 ? 'bg-purple-500' : 'bg-orange-500'
                  }`}></div>
                  <div>
                    <p className="font-medium text-gray-900">{subject.subject}</p>
                    <p className="text-xs text-gray-500">{subject.tests} tests taken</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900">{subject.score}%</p>
                  <div className="w-16 bg-gray-200 rounded-full h-1 mt-1">
                    <div 
                      className={`h-1 rounded-full ${
                        index === 0 ? 'bg-black' : 
                        index === 1 ? 'bg-gray-600' : 
                        index === 2 ? 'bg-gray-700' : 'bg-gray-800'
                      }`}
                      style={{ width: `${subject.score}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-blue-500" />
            Quick Actions
          </h2>
          <div className="space-y-3">
            <button className="w-full flex items-center p-3 text-left rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors group">
              <div className="p-2 bg-gray-100 rounded-lg mr-3 group-hover:bg-gray-200 transition-colors">
                <Trophy className="h-5 w-5 text-black" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Take Adaptive Mock Test</p>
                <p className="text-sm text-gray-500">AI-powered difficulty adjustment</p>
              </div>
            </button>
            
            <button className="w-full flex items-center p-3 text-left rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors group">
              <div className="p-2 bg-gray-100 rounded-lg mr-3 group-hover:bg-gray-200 transition-colors">
                <Brain className="h-5 w-5 text-black" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Practice Weak Areas</p>
                <p className="text-sm text-gray-500">Focus on improvement areas</p>
              </div>
            </button>
            
            <button className="w-full flex items-center p-3 text-left rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors group">
              <div className="p-2 bg-gray-100 rounded-lg mr-3 group-hover:bg-gray-200 transition-colors">
                <Users className="h-5 w-5 text-black" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Join Study Group</p>
                <p className="text-sm text-gray-500">Collaborate with peers</p>
              </div>
            </button>

            <button className="w-full flex items-center p-3 text-left rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors group">
              <div className="p-2 bg-gray-100 rounded-lg mr-3 group-hover:bg-gray-200 transition-colors">
                <Calendar className="h-5 w-5 text-black" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Schedule Study Session</p>
                <p className="text-sm text-gray-500">Plan your study time</p>
              </div>
            </button>
          </div>
        </div>

        {/* Recent Test Results */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <Award className="h-5 w-5 mr-2 text-black" />
            Recent Test Results
          </h2>
          
          {recentTests.length > 0 ? (
            <div className="space-y-3">
              {recentTests.map((result, index) => {
                const test = mockTests.find(t => t.id === result.testId);
                const scoreColor = result.score >= 80 ? 'text-green-600' : 
                                 result.score >= 60 ? 'text-yellow-600' : 'text-red-600';
                const bgColor = result.score >= 80 ? 'bg-green-50' : 
                               result.score >= 60 ? 'bg-yellow-50' : 'bg-red-50';
                
                return (
                  <div key={result.id} className={`flex items-center justify-between p-3 ${bgColor} rounded-lg`}>
                    <div>
                      <p className="font-medium text-gray-900">{test?.title}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(result.completedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${scoreColor}`}>{result.score}%</p>
                      <p className="text-xs text-gray-500">{result.timeTaken}min</p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <Trophy className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No tests taken yet</p>
              <p className="text-sm text-gray-400">Start with your first adaptive mock test!</p>
            </div>
          )}
        </div>
      </div>

      {/* Mock Test Performance Graph */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
          <BarChart3 className="h-5 w-5 mr-2 text-black" />
          Mock Test Performance
        </h2>
        
        {userResults.length > 0 ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-black">{averageScore}%</p>
                <p className="text-sm text-gray-600">Average Score</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-black">{userResults.length}</p>
                <p className="text-sm text-gray-600">Tests Completed</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-black">{userResults.filter(r => r.score >= 80).length}</p>
                <p className="text-sm text-gray-600">High Scores (80%+)</p>
              </div>
            </div>
            
            <div className="space-y-3">
              <h3 className="font-medium text-gray-900">Recent Test Scores</h3>
              {userResults.slice(-10).reverse().map((result, index) => {
                const test = mockTests.find(t => t.id === result.testId);
                return (
                  <div key={result.id} className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{test?.title || 'Test'}</p>
                      <p className="text-xs text-gray-500">{new Date(result.completedAt).toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-black h-2 rounded-full transition-all duration-500"
                          style={{ width: `${result.score}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-bold text-gray-900 w-12">{result.score}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <BarChart3 className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No test data available</p>
            <p className="text-sm text-gray-400">Take your first mock test to see performance graphs!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardHome;