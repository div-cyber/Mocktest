import React, { useState } from 'react';
import {  BookOpen, Trophy, Stethoscope } from 'lucide-react';
import NotesTab from './NotesTab';
import MockTestsTab from './MockTestsTab';

const MedicalSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'notes' | 'tests'>('notes');

  const tabs = [
    { id: 'notes' as const, name: 'Study Notes', icon: BookOpen },
    { id: 'tests' as const, name: 'Mock Tests', icon: Trophy }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-black rounded-xl shadow-lg text-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Medical Section</h1>
            <p className="text-gray-300">Prepare for medical entrance exams and build your knowledge</p>
          </div>
          <div className="hidden md:block">
            <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <Stethoscope className="h-8 w-8 text-white" />
            </div>
          </div>
        </div>
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

      {/* Tab Content */}
      <div className="min-h-96">
        {activeTab === 'notes' && <NotesTab section="medical" />}
        {activeTab === 'tests' && <MockTestsTab section="medical" />}
      </div>
    </div>
  );
};

export default MedicalSection;