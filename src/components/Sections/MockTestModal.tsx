import React, { useState, useEffect } from 'react';
import { getFeedback, getAdaptiveLevel, TestPaper, MCQ } from '../../api/gemini';
import { X, Clock, CheckCircle, Brain, TrendingUp, TrendingDown } from 'lucide-react';

interface MockTestModalProps {
  test: TestPaper;
  onClose: () => void;
}

const MockTestModal: React.FC<MockTestModalProps> = ({ test, onClose }) => {
  const [currentSubjectIndex, setCurrentSubjectIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [key: string]: number }>({});
  const [timeLeft, setTimeLeft] = useState(60 * 60); // Default 60 min, can be adjusted
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [adaptiveDifficulty, setAdaptiveDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [performanceStreak, setPerformanceStreak] = useState(0);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [loadingFeedback, setLoadingFeedback] = useState(false);

  // Calculate total duration (sum of all subjects' marks as minutes, or set a fixed duration)
  const totalDuration = test.subjects.reduce((sum, subj) => sum + subj.marks, 0);

  useEffect(() => {
    setTimeLeft(totalDuration * 60); // seconds
  }, [totalDuration]);

  useEffect(() => {
    if (timeLeft > 0 && !isSubmitted) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !isSubmitted) {
      handleSubmit();
    }
  }, [timeLeft, isSubmitted]);

  // Adaptive difficulty system (optional, can be expanded)
  useEffect(() => {
    if (Object.keys(answers).length > 0) {
      const recentAnswers = Object.entries(answers).slice(-3);
      const correctCount = recentAnswers.filter(([questionId, answerIndex]) => {
        for (const subj of test.subjects) {
          const question = subj.questions.find((q: any) => q.id === questionId);
          if (question && question.correctAnswer === answerIndex) return true;
        }
        return false;
      }).length;
      const accuracy = correctCount / recentAnswers.length;
      if (accuracy >= 0.8 && performanceStreak >= 2) {
        setAdaptiveDifficulty('hard');
        setPerformanceStreak(performanceStreak + 1);
      } else if (accuracy <= 0.4 && performanceStreak <= -2) {
        setAdaptiveDifficulty('easy');
        setPerformanceStreak(performanceStreak - 1);
      } else {
        setPerformanceStreak(0);
      }
    }
  }, [answers]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleAnswerSelect = (questionId: string, answerIndex: number) => {
    setAnswers({
      ...answers,
      [questionId]: answerIndex
    });
  };

  const handleSubmit = async () => {
    setIsSubmitted(true);
    setShowResults(true);
    setLoadingFeedback(true);
    // Calculate analytics
    const allQuestions = test.subjects.flatMap(subj => subj.questions);
    const correctAnswers = allQuestions.filter((question: any) => 
      answers[question.id] === question.correctAnswer
    ).length;
    const score = Math.round((correctAnswers / allQuestions.length) * 100);
    const timeTaken = totalDuration - Math.floor(timeLeft / 60);
    // Send analytics to Gemini for feedback
    try {
      const fb = await getFeedback({
        answers: Object.entries(answers).map(([questionId, selectedAnswer]) => ({ questionId, selectedAnswer })),
        section: test.examType,
        score,
        timeTaken,
        totalQuestions: allQuestions.length
      });
      setFeedback(fb);
    } catch {
      setFeedback('Could not fetch feedback.');
    }
    setLoadingFeedback(false);
  };

  // Navigation helpers
  const currentSubject = test.subjects[currentSubjectIndex];
  const currentQuestion = currentSubject.questions[currentQuestionIndex];
  const progress = ((currentSubjectIndex + currentQuestionIndex / currentSubject.questions.length) / test.subjects.length) * 100;

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'hard': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getDifficultyTrend = () => {
    if (performanceStreak > 0) return { icon: TrendingUp, color: 'text-green-600', text: 'Difficulty increasing' };
    if (performanceStreak < 0) return { icon: TrendingDown, color: 'text-blue-600', text: 'Difficulty adjusting' };
    return { icon: Brain, color: 'text-purple-600', text: 'Adaptive mode active' };
  };

  const difficultyTrend = getDifficultyTrend();
  const TrendIcon = difficultyTrend.icon;

  if (showResults) {
    const allQuestions = test.subjects.flatMap(subj => subj.questions);
    const correctAnswers = allQuestions.filter((question: any) => 
      answers[question.id] === question.correctAnswer
    ).length;
    const score = Math.round((correctAnswers / allQuestions.length) * 100);
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-96 overflow-y-auto">
          <div className="p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Adaptive Test Completed!</h2>
              <p className="text-gray-600">Here are your results with Gemini-powered analytics</p>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-blue-50 rounded-lg p-4 text-center">
                <p className="text-sm text-blue-600 font-medium">Final Score</p>
                <p className="text-2xl font-bold text-blue-900">{score}%</p>
              </div>
              <div className="bg-green-50 rounded-lg p-4 text-center">
                <p className="text-sm text-green-600 font-medium">Correct Answers</p>
                <p className="text-2xl font-bold text-green-900">{correctAnswers}/{allQuestions.length}</p>
              </div>
            </div>
            <div className="bg-purple-50 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-purple-900 mb-2">Gemini Feedback</h3>
              <div className="space-y-2 text-sm">
                {loadingFeedback ? (
                  <div className="text-purple-700">Loading feedback...</div>
                ) : (
                  <div className="text-purple-700 whitespace-pre-line">{feedback}</div>
                )}
              </div>
            </div>
            <div className="flex justify-center space-x-4">
              <button
                onClick={onClose}
                className="px-6 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-2 text-white bg-black rounded-lg hover:bg-gray-800 transition-colors"
              >
                Take Another Adaptive Test
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-full overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{test.examType.toUpperCase()} Adaptive Test</h2>
            <div className="flex items-center space-x-4 mt-1">
              <p className="text-sm text-gray-500">Subject: {currentSubject.subject}</p>
              <div className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(adaptiveDifficulty)}`}>
                {adaptiveDifficulty.toUpperCase()}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="flex items-center text-sm font-medium text-gray-700">
                <Clock className="h-4 w-4 mr-1 text-red-500" />
                {formatTime(timeLeft)}
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>
        {/* Progress Bar */}
        <div className="px-6 py-3 bg-gray-50">
          <div className="flex items-center justify-between mb-2">
            <div className="w-full bg-gray-200 rounded-full h-2 mr-4">
              <div 
                className="bg-black h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <div className={`flex items-center text-xs ${difficultyTrend.color}`}>
              <TrendIcon className="h-3 w-3 mr-1" />
              <span className="whitespace-nowrap">AI Adaptive</span>
            </div>
          </div>
        </div>
        {/* Question Content */}
        <div className="p-6">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {currentQuestion.question}
              </h3>
              <div className="flex items-center space-x-2">
                <Brain className="h-5 w-5 text-purple-500" />
                <span className="text-sm text-gray-500">Adaptive Question</span>
              </div>
            </div>
            <div className="space-y-3">
              {currentQuestion.options.map((option: string, index: number) => (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(currentQuestion.id, index)}
                  className={`
                    w-full text-left p-4 rounded-lg border-2 transition-all duration-200
                    ${answers[currentQuestion.id] === index
                      ? 'border-blue-500 bg-blue-50 text-blue-900 shadow-md'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 hover:shadow-sm'
                    }
                  `}
                >
                  <div className="flex items-center">
                    <span className={`
                      w-6 h-6 rounded-full border-2 flex items-center justify-center mr-3 text-sm font-medium transition-colors
                      ${answers[currentQuestion.id] === index
                        ? 'border-blue-500 bg-blue-500 text-white'
                        : 'border-gray-300'
                      }
                    `}>
                      {String.fromCharCode(65 + index)}
                    </span>
                    {option}
                  </div>
                </button>
              ))}
            </div>
          </div>
          {/* Navigation */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => {
                if (currentQuestionIndex === 0 && currentSubjectIndex > 0) {
                  setCurrentSubjectIndex(currentSubjectIndex - 1);
                  setCurrentQuestionIndex(test.subjects[currentSubjectIndex - 1].questions.length - 1);
                } else {
                  setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1));
                }
              }}
              disabled={currentQuestionIndex === 0 && currentSubjectIndex === 0}
              className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <div className="flex space-x-2">
              {currentSubjectIndex === test.subjects.length - 1 && currentQuestionIndex === currentSubject.questions.length - 1 ? (
                <button
                  onClick={handleSubmit}
                  className="px-6 py-2 text-white bg-black rounded-lg hover:bg-gray-800 transition-colors"
                >
                  Submit Adaptive Test
                </button>
              ) : (
                <button
                  onClick={() => {
                    if (currentQuestionIndex === currentSubject.questions.length - 1 && currentSubjectIndex < test.subjects.length - 1) {
                      setCurrentSubjectIndex(currentSubjectIndex + 1);
                      setCurrentQuestionIndex(0);
                    } else {
                      setCurrentQuestionIndex(Math.min(currentSubject.questions.length - 1, currentQuestionIndex + 1));
                    }
                  }}
                  className="px-4 py-2 text-white bg-black rounded-lg hover:bg-gray-800 transition-colors"
                >
                  Next
                </button>
              )}
            </div>
          </div>
        </div>
        {/* Subject Navigation */}
        <div className="p-6 bg-gray-50 border-t border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-gray-700">Subject Navigation</h4>
            <div className="flex items-center text-xs text-gray-500">
              {test.subjects.map((subj, idx) => (
                <span
                  key={subj.subject}
                  className={`mx-1 px-2 py-1 rounded-full font-medium ${idx === currentSubjectIndex ? 'bg-black text-white' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}
                  style={{ cursor: 'pointer' }}
                  onClick={() => {
                    setCurrentSubjectIndex(idx);
                    setCurrentQuestionIndex(0);
                  }}
                >
                  {subj.subject}
                </span>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-10 gap-2">
            {currentSubject.questions.map((_: any, index: number) => (
              <button
                key={index}
                onClick={() => setCurrentQuestionIndex(index)}
                className={`
                  w-8 h-8 text-xs font-medium rounded transition-colors
                  ${currentQuestionIndex === index
                    ? 'bg-black text-white'
                    : answers[currentSubject.questions[index].id] !== undefined
                    ? 'bg-green-200 text-green-800'
                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                  }
                `}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MockTestModal;