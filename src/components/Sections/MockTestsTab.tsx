import React, { useState, useEffect } from 'react';
import { Play, Trophy, Settings, Brain, Clock, Target, BookOpen, List } from 'lucide-react';
import MockTestModal from './MockTestModal';
import { useApp } from '../../contexts/AppContext';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

interface MockTestsTabProps {
  section: 'engineering' | 'medical';
}

interface Chapter {
  id: string;
  name: string;
  description: string;
  subject: string;
  order_index: number;
}

const MockTestsTab: React.FC<MockTestsTabProps> = ({ section }) => {
  const { generateAITest } = useApp();
  const { user } = useAuth();
  const [selectedTest, setSelectedTest] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [selectedChapter, setSelectedChapter] = useState<string>('');
  const [testType, setTestType] = useState<'full' | 'chapter'>('full');
  const [testConfig, setTestConfig] = useState({
    difficulty: 'medium' as 'easy' | 'medium' | 'hard',
    driveLink: '',
    adaptiveLevel: 1,
    timeLimit: 10800 // 3 hours in seconds
  });
  const [showConfig, setShowConfig] = useState(false);

  useEffect(() => {
    fetchChapters();
  }, [section]);

  const fetchChapters = async () => {
    try {
      const { data, error } = await supabase
        .from('chapters')
        .select('*')
        .eq('section', section)
        .eq('is_active', true)
        .order('order_index');

      if (error) throw error;
      setChapters(data || []);
    } catch (err) {
      console.error('Error fetching chapters:', err);
    }
  };

  const handleStartTest = async (customConfig?: any) => {
    setLoading(true);
    setError(null);
    try {
      const config = customConfig || testConfig;
      
      let testPaper;
      if (testType === 'chapter' && selectedChapter) {
        // Generate chapter-specific test
        const chapter = chapters.find(c => c.id === selectedChapter);
        testPaper = await generateChapterTest(chapter, config);
      } else {
        // Generate full test
        testPaper = await generateAITest({ 
          examType: section,
          difficulty: config.difficulty,
          driveLink: config.driveLink || undefined,
          adaptiveLevel: config.adaptiveLevel
        });
      }
      
      // Set 3-hour timer
      testPaper.timeLimit = 10800; // 3 hours in seconds
      setSelectedTest(testPaper);
      setShowConfig(false);
    } catch (err: any) {
      setError('Failed to generate test. Please try again.');
      console.error('Test generation error:', err);
    } finally {
      setLoading(false);
    }
  };

  const generateChapterTest = async (chapter: Chapter, config: any) => {
    // Generate chapter-specific test using Gemini
    const testPaper = await generateAITest({
      examType: section,
      difficulty: config.difficulty,
      driveLink: config.driveLink || undefined,
      adaptiveLevel: config.adaptiveLevel,
      chapter: chapter?.name,
      subject: chapter?.subject
    });

    // Customize for chapter
    testPaper.title = `${chapter?.name} - Chapter Test`;
    testPaper.description = chapter?.description;
    testPaper.timeLimit = 10800; // 3 hours

    return testPaper;
  };

  const handleCloseTest = () => {
    setSelectedTest(null);
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  // Group chapters by subject
  const chaptersBySubject = chapters.reduce((acc, chapter) => {
    if (!acc[chapter.subject]) {
      acc[chapter.subject] = [];
    }
    acc[chapter.subject].push(chapter);
    return acc;
  }, {} as Record<string, Chapter[]>);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Mock Tests</h2>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowConfig(!showConfig)}
            className="flex items-center px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <Settings className="h-4 w-4 mr-1" />
            Configure
          </button>
          <div className="flex items-center text-sm text-gray-600">
            <Clock className="h-4 w-4 mr-1" />
            {formatTime(testConfig.timeLimit)}
          </div>
        </div>
      </div>

      {/* Test Type Selection */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex items-center space-x-4 mb-4">
          <button
            onClick={() => setTestType('full')}
            className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
              testType === 'full'
                ? 'bg-black text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Trophy className="h-4 w-4 mr-2" />
            Full Test
          </button>
          <button
            onClick={() => setTestType('chapter')}
            className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
              testType === 'chapter'
                ? 'bg-black text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <BookOpen className="h-4 w-4 mr-2" />
            Chapter-wise Test
          </button>
        </div>

        {testType === 'chapter' && (
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900">Select Chapter:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(chaptersBySubject).map(([subject, subjectChapters]) => (
                <div key={subject} className="space-y-2">
                  <h4 className="font-medium text-sm text-gray-700 uppercase tracking-wide">
                    {subject}
                  </h4>
                  <div className="space-y-1">
                    {subjectChapters.map((chapter) => (
                      <button
                        key={chapter.id}
                        onClick={() => setSelectedChapter(chapter.id)}
                        className={`w-full text-left p-3 rounded-lg border transition-colors ${
                          selectedChapter === chapter.id
                            ? 'border-black bg-black text-white'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <div className="font-medium text-sm">{chapter.name}</div>
                        <div className={`text-xs mt-1 ${
                          selectedChapter === chapter.id ? 'text-gray-300' : 'text-gray-500'
                        }`}>
                          {chapter.description}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
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
          <p className="text-sm text-gray-600 mb-4">
            {testType === 'full' ? 'Full adaptive test (3 hours)' : 'Chapter-specific test'}
          </p>
          <button
            onClick={() => handleStartTest()}
            disabled={loading || (testType === 'chapter' && !selectedChapter)}
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
            disabled={loading || (testType === 'chapter' && !selectedChapter)}
            className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg transition-colors text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Target className="h-4 w-4 mr-2" />
            {loading ? 'Generating...' : 'Custom Test'}
          </button>
        </div>

        {/* Timed Practice */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
          <Clock className="h-12 w-12 text-orange-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Exam Simulation</h3>
          <p className="text-sm text-gray-600 mb-4">Full exam simulation (3 hours)</p>
          <button
            onClick={() => handleStartTest({...testConfig, difficulty: 'medium', adaptiveLevel: 2})}
            disabled={loading || (testType === 'chapter' && !selectedChapter)}
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