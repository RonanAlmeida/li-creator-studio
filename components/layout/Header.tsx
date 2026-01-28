'use client';

import { useState } from 'react';
import { Home, Users, Briefcase, MessageSquare, Bell, Settings, Search, Video } from 'lucide-react';

export default function Header() {
  const [showSettings, setShowSettings] = useState(false);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 bg-white z-50 shadow-sm">
        <div className="max-w-[1280px] mx-auto px-6">
          <div className="flex items-center justify-between h-[56px]">
            {/* Left section: Logo and Search */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-[34px] h-[34px] text-linkedin-blue fill-current">
                  <path d="M20.5 2h-17A1.5 1.5 0 002 3.5v17A1.5 1.5 0 003.5 22h17a1.5 1.5 0 001.5-1.5v-17A1.5 1.5 0 0020.5 2zM8 19H5v-9h3zM6.5 8.25A1.75 1.75 0 118.3 6.5a1.78 1.78 0 01-1.8 1.75zM19 19h-3v-4.74c0-1.42-.6-1.93-1.38-1.93A1.74 1.74 0 0013 14.19a.66.66 0 000 .14V19h-3v-9h2.9v1.3a3.11 3.11 0 012.7-1.4c1.55 0 3.36.86 3.36 3.66z"></path>
                </svg>
              </div>
              <div className="hidden md:flex items-center bg-linkedin-gray-100 rounded-md px-3 py-2">
                <Search className="w-4 h-4 text-linkedin-gray-600 mr-2" />
                <input
                  type="text"
                  placeholder="Search"
                  className="bg-transparent border-none outline-none text-sm w-56 placeholder:text-linkedin-gray-600"
                />
              </div>
            </div>

            {/* Right section: Navigation Icons */}
            <nav className="flex items-center gap-1">
              <NavItem icon={<Home className="w-5 h-5" />} label="Home" active />
              <NavItem icon={<Users className="w-5 h-5" />} label="Network" />
              <NavItem icon={<Briefcase className="w-5 h-5" />} label="Projects" />
              <NavItem icon={<MessageSquare className="w-5 h-5" />} label="Messages" />
              <NavItem icon={<Bell className="w-5 h-5" />} label="Alerts" />
              <button
                onClick={() => setShowSettings(true)}
                className="flex flex-col items-center gap-1 px-3 py-1 rounded-lg hover:bg-linkedin-gray-100 transition-colors text-linkedin-gray-600 hover:text-linkedin-gray-900"
              >
                <Settings className="w-5 h-5" />
                <span className="text-xs hidden lg:block font-medium">Settings</span>
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Settings Modal */}
      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
    </>
  );
}

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
}

function NavItem({ icon, label, active }: NavItemProps) {
  return (
    <button
      className={`relative flex flex-col items-center gap-1 px-3 py-1 rounded-lg transition-colors ${
        active ? 'text-linkedin-gray-900' : 'text-linkedin-gray-600 hover:text-linkedin-gray-900 hover:bg-linkedin-gray-100'
      }`}
    >
      {icon}
      <span className="text-xs hidden lg:block font-medium">{label}</span>
      {active && (
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-[2px] bg-linkedin-gray-900 rounded-full" />
      )}
    </button>
  );
}

interface SettingsModalProps {
  onClose: () => void;
}

function SettingsModal({ onClose }: SettingsModalProps) {
  const [apiKeys, setApiKeys] = useState({
    textToVideo: '',
    imageToVideo: '',
    videoToVideo: '',
    captions: '',
    audio: '',
    openai: '',
    anthropic: '',
  });

  const handleSave = () => {
    // Save API keys to localStorage
    localStorage.setItem('creator-studio-api-keys', JSON.stringify(apiKeys));
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center animate-fade-in" onClick={onClose}>
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-3xl mx-4 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-linkedin-blue px-6 py-5 border-b border-linkedin-gray-200">
          <h2 className="text-2xl font-bold text-white">Settings</h2>
          <p className="text-sm text-white/90 mt-1">Configure your API keys and environment variables</p>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          <div className="space-y-6">
            {/* Video Generation APIs */}
            <div>
              <h3 className="text-base font-bold text-linkedin-gray-900 mb-4 pb-2 border-b border-linkedin-gray-200">
                Video Generation APIs
              </h3>
              <div className="space-y-4">
                <ApiKeyInput
                  label="Text to Video API Key"
                  placeholder="sk-..."
                  value={apiKeys.textToVideo}
                  onChange={(val) => setApiKeys({ ...apiKeys, textToVideo: val })}
                  description="API key for text-to-video generation service"
                />
                <ApiKeyInput
                  label="Image to Video API Key"
                  placeholder="sk-..."
                  value={apiKeys.imageToVideo}
                  onChange={(val) => setApiKeys({ ...apiKeys, imageToVideo: val })}
                  description="API key for image-to-video conversion"
                />
                <ApiKeyInput
                  label="Video to Video API Key"
                  placeholder="sk-..."
                  value={apiKeys.videoToVideo}
                  onChange={(val) => setApiKeys({ ...apiKeys, videoToVideo: val })}
                  description="API key for video transformation"
                />
              </div>
            </div>

            {/* Media Processing APIs */}
            <div>
              <h3 className="text-base font-bold text-linkedin-gray-900 mb-4 pb-2 border-b border-linkedin-gray-200">
                Media Processing APIs
              </h3>
              <div className="space-y-4">
                <ApiKeyInput
                  label="Captions API Key"
                  placeholder="sk-..."
                  value={apiKeys.captions}
                  onChange={(val) => setApiKeys({ ...apiKeys, captions: val })}
                  description="API key for caption generation and styling"
                />
                <ApiKeyInput
                  label="Audio API Key"
                  placeholder="sk-..."
                  value={apiKeys.audio}
                  onChange={(val) => setApiKeys({ ...apiKeys, audio: val })}
                  description="API key for audio processing and generation"
                />
              </div>
            </div>

            {/* AI Services */}
            <div>
              <h3 className="text-base font-bold text-linkedin-gray-900 mb-4 pb-2 border-b border-linkedin-gray-200">
                AI Services
              </h3>
              <div className="space-y-4">
                <ApiKeyInput
                  label="OpenAI API Key"
                  placeholder="sk-..."
                  value={apiKeys.openai}
                  onChange={(val) => setApiKeys({ ...apiKeys, openai: val })}
                  description="For GPT-powered script generation"
                />
                <ApiKeyInput
                  label="Anthropic API Key"
                  placeholder="sk-ant-..."
                  value={apiKeys.anthropic}
                  onChange={(val) => setApiKeys({ ...apiKeys, anthropic: val })}
                  description="For Claude-powered content assistance"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-linkedin-gray-100 flex justify-between items-center">
          <p className="text-xs text-linkedin-gray-600">
            API keys are stored locally in your browser
          </p>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-semibold text-linkedin-gray-700 hover:bg-linkedin-gray-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="linkedin-button-primary text-sm"
            >
              Save Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

interface ApiKeyInputProps {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  description?: string;
}

function ApiKeyInput({ label, placeholder, value, onChange, description }: ApiKeyInputProps) {
  return (
    <div>
      <label className="block text-sm font-semibold text-linkedin-gray-900 mb-1">
        {label}
      </label>
      {description && (
        <p className="text-xs text-linkedin-gray-600 mb-2">{description}</p>
      )}
      <input
        type="password"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-2.5 border border-linkedin-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-linkedin-blue focus:border-transparent transition-all text-sm"
      />
    </div>
  );
}
