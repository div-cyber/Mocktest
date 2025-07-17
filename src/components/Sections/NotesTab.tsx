import React from 'react';
import { useApp } from '../../contexts/AppContext';
import { useAuth } from '../../contexts/AuthContext';
import { Download, Calendar, User, Eye, FileText, Brain, Plus, Sparkles } from 'lucide-react';
import AINotesGenerator from './AINotesGenerator';

interface NotesTabProps {
  section: 'engineering' | 'medical';
}

const NotesTab: React.FC<NotesTabProps> = ({ section }) => {
  const { notes, aiNotes, fetchAINotes } = useApp();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = React.useState<'regular' | 'ai'>('regular');
  const [showAIGenerator, setShowAIGenerator] = React.useState(false);

  React.useEffect(() => {
    fetchAINotes(section);
  }, [section, fetchAINotes]);

  const sectionNotes = notes.filter(note => note.section === section);
  const sectionAINotes = aiNotes.filter(note => note.section === section);

  const handleViewNote = (note: any) => {
    // In a real app, this would open a modal or navigate to a detailed view
    alert(`Opening: ${note.title}\n\n${note.content}`);
  };

  const handleDownload = (note: any) => {
    // In a real app, this would download the actual file
    alert(`Downloading: ${note.title}`);
  };

  const renderRegularNotes = () => {
    if (sectionNotes.length === 0) {
      return (
        <div className="text-center py-12">
          <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Notes Available</h3>
          <p className="text-gray-500">
            No study notes have been uploaded for the {section} section yet.
          </p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sectionNotes.map((note) => (
          <div key={note.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{note.title}</h3>
                  <span className="inline-block px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                    {note.subject}
                  </span>
                </div>
              </div>

              <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                {note.content}
              </p>

              <div className="flex items-center text-xs text-gray-500 mb-4 space-x-4">
                <div className="flex items-center">
                  <User className="h-3 w-3 mr-1" />
                  {note.uploadedBy}
                </div>
                <div className="flex items-center">
                  <Calendar className="h-3 w-3 mr-1" />
                  {new Date(note.uploadedAt).toLocaleDateString()}
                </div>
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => handleViewNote(note)}
                  className="flex-1 flex items-center justify-center px-3 py-2 text-sm font-medium text-white bg-black rounded-lg hover:bg-gray-800 transition-colors"
                >
                  <Eye className="h-4 w-4 mr-1" />
                  View
                </button>
                {note.fileUrl && (
                  <button
                    onClick={() => handleDownload(note)}
                    className="flex items-center justify-center px-3 py-2 text-sm font-medium text-gray-600 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <Download className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderAINotes = () => {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Brain className="h-5 w-5 text-purple-600 mr-2" />
            <span className="text-sm text-gray-600">AI-Generated Study Notes</span>
          </div>
          <button
            onClick={() => setShowAIGenerator(true)}
            className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            Generate Notes
          </button>
        </div>

        {sectionAINotes.length === 0 ? (
          <div className="text-center py-12">
            <Sparkles className="h-16 w-16 text-purple-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No AI Notes Yet</h3>
            <p className="text-gray-500 mb-4">
              Generate AI-powered study notes on any topic using Gemini AI.
            </p>
            <button
              onClick={() => setShowAIGenerator(true)}
              className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors mx-auto"
            >
              <Brain className="h-4 w-4 mr-2" />
              Generate Your First Notes
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sectionAINotes.map((note) => (
              <div key={note.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <Brain className="h-4 w-4 text-purple-600 mr-1" />
                        <span className="text-xs text-purple-600 font-medium">AI Generated</span>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{note.title}</h3>
                      <div className="flex items-center space-x-2">
                        <span className="inline-block px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded-full">
                          {note.subject}
                        </span>
                        <span className="inline-block px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                          {note.difficulty}
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    Topic: {note.topic}
                  </p>

                  <div className="flex items-center text-xs text-gray-500 mb-4 space-x-4">
                    <div className="flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      {new Date(note.created_at).toLocaleDateString()}
                    </div>
                    {note.tags && note.tags.length > 0 && (
                      <div className="flex items-center">
                        <span className="text-xs text-gray-400">
                          {note.tags.slice(0, 2).join(', ')}
                        </span>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => handleViewNote(note)}
                    className="w-full flex items-center justify-center px-3 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View AI Notes
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Study Notes</h2>
        <p className="text-gray-500">{sectionNotes.length} notes available</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Study Notes</h2>
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveTab('regular')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              activeTab === 'regular'
                ? 'bg-black text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <FileText className="h-4 w-4 mr-1 inline" />
            Regular Notes
          </button>
          <button
            onClick={() => setActiveTab('ai')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              activeTab === 'ai'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Brain className="h-4 w-4 mr-1 inline" />
            AI Notes
          </button>
        </div>
      </div>

      {activeTab === 'regular' ? renderRegularNotes() : renderAINotes()}

      {showAIGenerator && (
        <AINotesGenerator
          section={section}
          onClose={() => setShowAIGenerator(false)}
          onGenerated={() => {
            setShowAIGenerator(false);
            fetchAINotes(section);
          }}
        />
      )}
    </div>
  );
};

export default NotesTab;
          </div>
        ))}
      </div>
  );
};

export default NotesTab;