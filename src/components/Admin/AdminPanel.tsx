import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Plus, 
  BookOpen, 
  Trophy, 
  Save, 
  X, 
  Users, 
  BarChart3, 
  TrendingUp,
  Award,
  Clock,
  Target,
  Activity,
  Filter,
  Download
} from 'lucide-react';

const AdminPanel: React.FC = () => {
  const { addNote, addMockTest, testResults, mockTests } = useApp();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'students' | 'notes' | 'tests'>('overview');
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [showTestForm, setShowTestForm] = useState(false);

  const [noteForm, setNoteForm] = useState({
    title: '',
    content: '',
    subject: '',
    section: 'engineering' as 'engineering' | 'medical'
  });

  const [testForm, setTestForm] = useState({
    title: '',
    description: '',
    section: 'engineering' as 'engineering' | 'medical',
    subject: '',
    duration: 60,
    totalMarks: 100,
    questions: [
      {
        question: '',
        options: ['', '', '', ''],
        correctAnswer: 0,
        explanation: '',
        subject: '',
        difficulty: 'medium' as 'easy' | 'medium' | 'hard'
      }
    ]
  });

  // Mock student data
  const students = [
    {
      id: '1',
      name: 'John Doe',
      email: 'john@engineering.com',
      section: 'engineering',
      testsCompleted: 12,
      averageScore: 85,
      lastActive: '2025-01-15',
      totalStudyTime: 45,
      streak: 7
    },
    {
      id: '2',
      name: 'Jane Smith',
      email: 'jane@medical.com',
      section: 'medical',
      testsCompleted: 8,
      averageScore: 92,
      lastActive: '2025-01-14',
      totalStudyTime: 32,
      streak: 5
    },
    {
      id: '3',
      name: 'Mike Johnson',
      email: 'mike@engineering.com',
      section: 'engineering',
      testsCompleted: 15,
      averageScore: 78,
      lastActive: '2025-01-15',
      totalStudyTime: 52,
      streak: 12
    },
    {
      id: '4',
      name: 'Sarah Wilson',
      email: 'sarah@medical.com',
      section: 'medical',
      testsCompleted: 10,
      averageScore: 88,
      lastActive: '2025-01-13',
      totalStudyTime: 38,
      streak: 3
    }
  ];

  const handleNoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addNote({
      ...noteForm,
      uploadedBy: 'Admin',
      uploadedAt: new Date().toISOString()
    });
    setNoteForm({ title: '', content: '', subject: '', section: 'engineering' });
    setShowNoteForm(false);
  };

  const handleTestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addMockTest(testForm);
    setTestForm({
      title: '',
      description: '',
      section: 'engineering',
      subject: '',
      duration: 60,
      totalMarks: 100,
      questions: [{
        question: '',
        options: ['', '', '', ''],
        correctAnswer: 0,
        explanation: '',
        subject: '',
        difficulty: 'medium'
      }]
    });
    setShowTestForm(false);
  };

  const addQuestion = () => {
    setTestForm({
      ...testForm,
      questions: [
        ...testForm.questions,
        {
          question: '',
          options: ['', '', '', ''],
          correctAnswer: 0,
          explanation: '',
          subject: testForm.subject,
          difficulty: 'medium'
        }
      ]
    });
  };

  const updateQuestion = (index: number, field: string, value: any) => {
    const updatedQuestions = testForm.questions.map((q, i) => 
      i === index ? { ...q, [field]: value } : q
    );
    setTestForm({ ...testForm, questions: updatedQuestions });
  };

  const removeQuestion = (index: number) => {
    if (testForm.questions.length > 1) {
      setTestForm({
        ...testForm,
        questions: testForm.questions.filter((_, i) => i !== index)
      });
    }
  };

  // Analytics calculations
  const totalStudents = students.length;
  const totalTests = mockTests.length;
  const totalTestsCompleted = testResults.length;
  const averageScore = testResults.length > 0 
    ? Math.round(testResults.reduce((sum, result) => sum + result.score, 0) / testResults.length)
    : 0;

  const engineeringStudents = students.filter(s => s.section === 'engineering');
  const medicalStudents = students.filter(s => s.section === 'medical');

  const tabs = [
    { id: 'overview' as const, name: 'Overview', icon: BarChart3 },
    { id: 'students' as const, name: 'Students', icon: Users },
    { id: 'notes' as const, name: 'Notes', icon: BookOpen },
    { id: 'tests' as const, name: 'Tests', icon: Trophy }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-black rounded-xl shadow-lg text-white p-6">
        <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-gray-300">Manage students, content, and track performance</p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors
                  ${activeTab === tab.id
                    ? 'border-black text-black'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                <Icon className="h-5 w-5 mr-2" />
                {tab.name}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Content */}
      <div className="min-h-96">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-lg bg-blue-50">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Students</p>
                    <p className="text-2xl font-bold text-gray-900">{totalStudents}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-lg bg-green-50">
                    <Trophy className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Tests</p>
                    <p className="text-2xl font-bold text-gray-900">{totalTests}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-lg bg-purple-50">
                    <Activity className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Tests Completed</p>
                    <p className="text-2xl font-bold text-gray-900">{totalTestsCompleted}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-lg bg-orange-50">
                    <Target className="h-6 w-6 text-orange-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Average Score</p>
                    <p className="text-2xl font-bold text-gray-900">{averageScore}%</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Section Performance */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Engineering Section</h3>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Students</span>
                    <span className="font-medium">{engineeringStudents.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Avg. Score</span>
                    <span className="font-medium">
                      {Math.round(engineeringStudents.reduce((sum, s) => sum + s.averageScore, 0) / engineeringStudents.length)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Study Time</span>
                    <span className="font-medium">
                      {engineeringStudents.reduce((sum, s) => sum + s.totalStudyTime, 0)}h
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Medical Section</h3>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Students</span>
                    <span className="font-medium">{medicalStudents.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Avg. Score</span>
                    <span className="font-medium">
                      {Math.round(medicalStudents.reduce((sum, s) => sum + s.averageScore, 0) / medicalStudents.length)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Study Time</span>
                    <span className="font-medium">
                      {medicalStudents.reduce((sum, s) => sum + s.totalStudyTime, 0)}h
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Activity</h3>
              <div className="space-y-3">
                {testResults.slice(-5).reverse().map((result, index) => {
                  const test = mockTests.find(t => t.id === result.testId);
                  const student = students.find(s => s.id === result.userId);
                  return (
                    <div key={result.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">
                          {student?.name} completed {test?.title}
                        </p>
                        <p className="text-sm text-gray-500">
                          {new Date(result.completedAt).toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold ${
                          result.score >= 80 ? 'text-green-600' : 
                          result.score >= 60 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {result.score}%
                        </p>
                        <p className="text-xs text-gray-500">{result.timeTaken}min</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'students' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Student Management</h2>
              <div className="flex space-x-2">
                <button className="flex items-center px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </button>
                <button className="flex items-center px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </button>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Student
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Section
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tests Completed
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Average Score
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Study Time
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Streak
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Last Active
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {students.map((student) => (
                      <tr key={student.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-green-500 flex items-center justify-center">
                                <span className="text-white font-medium text-sm">
                                  {student.name.split(' ').map(n => n[0]).join('')}
                                </span>
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{student.name}</div>
                              <div className="text-sm text-gray-500">{student.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            student.section === 'engineering' 
                              ? 'bg-blue-100 text-blue-800' 
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {student.section}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {student.testsCompleted}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <span className={`text-sm font-medium ${
                              student.averageScore >= 80 ? 'text-green-600' :
                              student.averageScore >= 60 ? 'text-yellow-600' : 'text-red-600'
                            }`}>
                              {student.averageScore}%
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {student.totalStudyTime}h
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Award className="h-4 w-4 text-orange-500 mr-1" />
                            <span className="text-sm text-gray-900">{student.streak} days</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(student.lastActive).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'notes' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Study Notes Management</h2>
              <button
                onClick={() => setShowNoteForm(true)}
                className="flex items-center px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
              >
                <Plus className="h-5 w-5 mr-2" />
                Add New Note
              </button>
            </div>

            {showNoteForm && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Add New Study Note</h3>
                  <button
                    onClick={() => setShowNoteForm(false)}
                    className="p-2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <form onSubmit={handleNoteSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Title
                      </label>
                      <input
                        type="text"
                        required
                        value={noteForm.title}
                        onChange={(e) => setNoteForm({ ...noteForm, title: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Subject
                      </label>
                      <input
                        type="text"
                        required
                        value={noteForm.subject}
                        onChange={(e) => setNoteForm({ ...noteForm, subject: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Section
                    </label>
                    <select
                      value={noteForm.section}
                      onChange={(e) => setNoteForm({ ...noteForm, section: e.target.value as 'engineering' | 'medical' })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="engineering">Engineering</option>
                      <option value="medical">Medical</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Content
                    </label>
                    <textarea
                      required
                      rows={6}
                      value={noteForm.content}
                      onChange={(e) => setNoteForm({ ...noteForm, content: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setShowNoteForm(false)}
                      className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex items-center px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Save Note
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}

        {activeTab === 'tests' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Mock Tests Management</h2>
              <button
                onClick={() => setShowTestForm(true)}
               className="flex items-center px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
              >
                <Plus className="h-5 w-5 mr-2" />
                Add New Test
              </button>
            </div>

            {showTestForm && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Add New Mock Test</h3>
                  <button
                    onClick={() => setShowTestForm(false)}
                    className="p-2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <form onSubmit={handleTestSubmit} className="space-y-6">
                  {/* Test Basic Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Test Title
                      </label>
                      <input
                        type="text"
                        required
                        value={testForm.title}
                        onChange={(e) => setTestForm({ ...testForm, title: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Subject
                      </label>
                      <input
                        type="text"
                        required
                        value={testForm.subject}
                        onChange={(e) => setTestForm({ ...testForm, subject: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={testForm.description}
                      onChange={(e) => setTestForm({ ...testForm, description: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Section
                      </label>
                      <select
                        value={testForm.section}
                        onChange={(e) => setTestForm({ ...testForm, section: e.target.value as 'engineering' | 'medical' })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="engineering">Engineering</option>
                        <option value="medical">Medical</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Duration (minutes)
                      </label>
                      <input
                        type="number"
                        required
                        min="1"
                        value={testForm.duration}
                        onChange={(e) => setTestForm({ ...testForm, duration: parseInt(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Total Marks
                      </label>
                      <input
                        type="number"
                        required
                        min="1"
                        value={testForm.totalMarks}
                        onChange={(e) => setTestForm({ ...testForm, totalMarks: parseInt(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  {/* Questions */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-medium text-gray-900">Questions</h4>
                      <button
                        type="button"
                        onClick={addQuestion}
                        className="flex items-center px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add Question
                      </button>
                    </div>

                    <div className="space-y-6">
                      {testForm.questions.map((question, qIndex) => (
                        <div key={qIndex} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <h5 className="font-medium text-gray-900">Question {qIndex + 1}</h5>
                            {testForm.questions.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeQuestion(qIndex)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            )}
                          </div>

                          <div className="space-y-3">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Question Text
                              </label>
                              <input
                                type="text"
                                required
                                value={question.question}
                                onChange={(e) => updateQuestion(qIndex, 'question', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Difficulty
                                </label>
                                <select
                                  value={question.difficulty}
                                  onChange={(e) => updateQuestion(qIndex, 'difficulty', e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                  <option value="easy">Easy</option>
                                  <option value="medium">Medium</option>
                                  <option value="hard">Hard</option>
                                </select>
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Subject
                                </label>
                                <input
                                  type="text"
                                  value={question.subject}
                                  onChange={(e) => updateQuestion(qIndex, 'subject', e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                              </div>
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Options
                              </label>
                              <div className="space-y-2">
                                {question.options.map((option, oIndex) => (
                                  <div key={oIndex} className="flex items-center space-x-2">
                                    <input
                                      type="radio"
                                      name={`correct-${qIndex}`}
                                      checked={question.correctAnswer === oIndex}
                                      onChange={() => updateQuestion(qIndex, 'correctAnswer', oIndex)}
                                      className="text-green-600"
                                    />
                                    <input
                                      type="text"
                                      required
                                      placeholder={`Option ${String.fromCharCode(65 + oIndex)}`}
                                      value={option}
                                      onChange={(e) => {
                                        const newOptions = [...question.options];
                                        newOptions[oIndex] = e.target.value;
                                        updateQuestion(qIndex, 'options', newOptions);
                                      }}
                                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                  </div>
                                ))}
                              </div>
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Explanation
                              </label>
                              <textarea
                                rows={2}
                                value={question.explanation}
                                onChange={(e) => updateQuestion(qIndex, 'explanation', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setShowTestForm(false)}
                      className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex items-center px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Save Test
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;