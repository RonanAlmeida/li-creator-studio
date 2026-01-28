'use client';

import { TabId } from '@/types';
import { FileText, Image, Video } from 'lucide-react';
import { motion } from 'framer-motion';

interface Tab {
  id: TabId;
  label: string;
  icon: React.ReactNode;
}

const tabs: Tab[] = [
  { id: 'text-to-video', label: 'Text to Video', icon: <FileText className="w-5 h-5" /> },
  { id: 'image-to-video', label: 'Image to Video', icon: <Image className="w-5 h-5" /> },
  { id: 'video-to-video', label: 'Video to Video', icon: <Video className="w-5 h-5" /> },
];

interface TabNavigationProps {
  activeTab: TabId;
  onTabChange: (tabId: TabId) => void;
}

export default function TabNavigation({ activeTab, onTabChange }: TabNavigationProps) {
  return (
    <div className="border-b border-linkedin-gray-200 mb-6">
      <div className="flex gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`relative flex items-center gap-2 px-6 py-3 text-sm font-semibold transition-colors ${
              activeTab === tab.id
                ? 'text-linkedin-blue'
                : 'text-linkedin-gray-600 hover:text-linkedin-gray-900 hover:bg-linkedin-gray-100'
            }`}
          >
            {tab.icon}
            <span className="hidden sm:inline">{tab.label}</span>
            {activeTab === tab.id && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-[3px] bg-linkedin-blue"
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
