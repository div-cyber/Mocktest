import React, { useState } from 'react';
import { Play, Trophy, Settings, Brain, Clock, Target } from 'lucide-react';
import MockTestModal from './MockTestModal';
import { useApp } from '../../contexts/AppContext';
import { useAuth } from '../../contexts/AuthContext';

interface MockTestsTabProps {
  section: 'engineering' | 'medical';
}

const MockTestsTab: React.FC<MockTestsTabProps> = ({ section }) => {
  const { generateAITest } = useApp();
  const { user } = useAuth();
  const [selectedTest, setSelectedTest] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [testConfig, setTestConfig] = useState({
    difficulty: 'medium' as 'easy' | 'medium' | 'hard',
    driveLink: '',
    adaptiveLevel: 1
  });
  const [showConfig, setShowConfig] = useState(false);

  const handleStartTest = async (customConfig?: any) => {
    setLoading(true);
    setError(null);
    try {
      const config = customConfig || testConfig;
      const testPaper = await generateAITest({ 
        examType: section,
        difficulty: config.difficulty,
        driveLink: config.driveLink || undefined,
        adaptiveLevel: config.adaptiveLevel
      });
      setSelectedTest(testPaper);
      setShowConfig(false);
    } catch (err: any) {
      setError('Failed to generate adaptive test. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseTest = () => {
    setSelectedTest(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Adaptive Mock Tests</h2>
        <button
          onClick={() => setShowConfig(!showConfig)}
          className="flex items-center px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          <Settings className="h-4 w-4 mr-1" />
          Configure
        </button>
      </div>

      {showConfig && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Test Configuration</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Difficulty Level
              </label>
              <select
                value={testConfig.difficulty}
                onChange={(e) => setTestConfig({...testConfig, difficulty: e.target.value as 'easy' | 'medium' | 'hard'})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Adaptive Level
              </label>
              <select
                value={testConfig.adaptiveLevel}
                onChange={(e) => setTestConfig({...testConfig, adaptiveLevel: parseInt(e.target.value)})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
              >
                <option value={1}>Level 1 (Beginner)</option>
                <option value={2}>Level 2 (Intermediate)</option>
                <option value={3}>Level 3 (Advanced)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Google Drive Link (Optional)
              </label>
              <input
                type="url"
                value={testConfig.driveLink}
                onChange={(e) => setTestConfig({...testConfig, driveLink: e.target.value})}
                placeholder="https://drive.google.com/..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Quick Start */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
          <Brain className="h-12 w-12 text-blue-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Quick Start</h3>
          <p className="text-sm text-gray-600 mb-4">Start with default adaptive settings</p>
          <button
            onClick={() => handleStartTest()}
            disabled={loading}
            className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg transition-colors text-white bg-black hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Play className="h-4 w-4 mr-2" />
            {loading ? 'Generating...' : 'Start Test'}
          </button>
        </div>

        {/* Custom Test */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
          <Settings className="h-12 w-12 text-green-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Custom Test</h3>
          <p className="text-sm text-gray-600 mb-4">Configure difficulty and content source</p>
          <button
            onClick={() => handleStartTest(testConfig)}
            disabled={loading}
            className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg transition-colors text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Target className="h-4 w-4 mr-2" />
            {loading ? 'Generating...' : 'Custom Test'}
          </button>
        </div>

        {/* Timed Practice */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
          <Clock className="h-12 w-12 text-orange-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Timed Practice</h3>
          <p className="text-sm text-gray-600 mb-4">Full exam simulation with time limits</p>
          <button
            onClick={() => handleStartTest({...testConfig, difficulty: 'medium', adaptiveLevel: 2})}
            disabled={loading}
            className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg transition-colors text-white bg-orange-600 hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Trophy className="h-4 w-4 mr-2" />
            {loading ? 'Generating...' : 'Exam Mode'}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="text-red-800">{error}</div>
        </div>
      )}

      {selectedTest && (
        <MockTestModal
          test={selectedTest}
          onClose={handleCloseTest}
        />
      )}
    </div>
  );
};

export default MockTestsTab;