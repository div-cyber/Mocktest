import React from 'react';
import { useApp } from '../../contexts/AppContext';
import { Download, Calendar, User, Eye, FileText } from 'lucide-react';

interface NotesTabProps {
  section: 'engineering' | 'medical';
}

const NotesTab: React.FC<NotesTabProps> = ({ section }) => {
  const { notes } = useApp();
  const sectionNotes = notes.filter(note => note.section === section);

  const handleViewNote = (note: any) => {
    // In a real app, this would open a modal or navigate to a detailed view
    alert(`Opening: ${note.title}\n\n${note.content}`);
  };

  const handleDownload = (note: any) => {
    // In a real app, this would download the actual file
    alert(`Downloading: ${note.title}`);
  };

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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Study Notes</h2>
        <p className="text-gray-500">{sectionNotes.length} notes available</p>
      </div>

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
    </div>
  );
};

export default NotesTab;