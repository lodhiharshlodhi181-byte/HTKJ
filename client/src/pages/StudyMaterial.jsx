import React, { useState } from 'react';
import { BookOpen, Upload, RefreshCw, Layers } from 'lucide-react';
import StudyNotes from './StudyNotes';
import UploadPaper from './uploadpaper';
import SRS from './SRS';

const StudyMaterial = () => {
  const [activeTab, setActiveTab] = useState('notes');

  const tabs = [
    { id: 'notes', label: 'AI Notes', icon: <BookOpen size={18} /> },
    { id: 'upload', label: 'PYQ Upload', icon: <Upload size={18} /> },
    { id: 'revision', label: 'Revision (SRS)', icon: <RefreshCw size={18} /> },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
      <div className="text-center space-y-2 mb-8">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-3">
          <Layers className="text-purple-400" size={32} />
          Study Hub
        </h1>
        <p className="text-gray-400">Your centralized vault for Notes, Past Papers, and AI Revision.</p>
      </div>

      {/* Custom Tabs Navigation */}
      <div className="flex justify-center mb-8">
        <div className="inline-flex bg-black/40 p-1.5 rounded-xl border border-white/10 backdrop-blur-md">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium transition-all duration-300 ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content Area */}
      <div className="mt-4">
        {activeTab === 'notes' && <StudyNotes />}
        {activeTab === 'upload' && <UploadPaper />}
        {activeTab === 'revision' && <SRS />}
      </div>
    </div>
  );
};

export default StudyMaterial;
