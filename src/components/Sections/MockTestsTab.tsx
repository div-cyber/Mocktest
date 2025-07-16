import React, { useState } from 'react';
import { Play, Trophy } from 'lucide-react';
import MockTestModal from './MockTestModal';
import { generateTestPaper, TestPaper } from '../../api/gemini';

interface MockTestsTabProps {
  section: 'engineering' | 'medical';
}

const MockTestsTab: React.FC<MockTestsTabProps> = ({ section }) => {
  const [selectedTest, setSelectedTest] = useState<TestPaper | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStartTest = async () => {
    setLoading(true);
    setError(null);
    try {
      const testPaper = await generateTestPaper({ examType: section });
      setSelectedTest(testPaper);
    } catch (err: any) {
      setError('Failed to generate test. Please try again.');
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
        <h2 className="text-2xl font-bold text-gray-900">Mock Tests</h2>
      </div>
      <div className="flex flex-col items-center justify-center py-12">
        <Trophy className="h-16 w-16 text-gray-300 mb-4" />
        <button
          onClick={handleStartTest}
          disabled={loading}
          className="w-full max-w-xs flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg transition-colors text-white bg-black hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Play className="h-4 w-4 mr-2" />
          {loading ? 'Generating Test...' : 'Start Adaptive Test'}
        </button>
        {error && <div className="text-red-500 mt-4">{error}</div>}
      </div>
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