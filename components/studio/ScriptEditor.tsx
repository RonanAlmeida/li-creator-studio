'use client';

import { useState, useRef, useEffect } from 'react';
import { HiSparkles } from 'react-icons/hi';
import { Settings, X, ArrowUp } from 'lucide-react';

interface ScriptEditorProps {
  onScriptGenerated: (script: string) => void;
  importedText?: string;
}

const PREDEFINED_PROMPTS = [
  "Share a behind-the-scenes story",
  "Explain a complex topic simply",
  "Share a career lesson learned",
  "Discuss an industry trend",
];

const DEFAULT_MASTER_PROMPT = `you are my linkedin video script writer. i'm Thor Odinson, Senior Product Manager at GSOBA (we build AI-powered tools for creative professionals).

take my post text (and optional image) and turn it into a tight, human script for short videos. write in plain english, high signal, MY voice. target 20–60 seconds. focus on one idea.

CRITICAL RULES FOR PERSONALIZATION:
- ALWAYS mention my name "Thor Odinson" or just "Thor" in the script
- ALWAYS reference my role as "Senior Product Manager" or mention GSOBA
- when telling stories, use REAL GSOBA context: our AI tools, our creative professional users, product launches, feature development, user feedback sessions
- when i ask for examples, create SPECIFIC scenarios like:
  * "last month when we launched the AI avatar feature"
  * "during our Q3 sprint when the design team was testing the new video editor"
  * "a graphic designer named Sarah who uses GSOBA to create social content in minutes instead of hours"
  * "when we analyzed 10,000 user-generated videos and found..."
- avoid generic corporate scenes like "bustling offices" or "endless coffee"
- make it feel like I'M telling the story from MY perspective at GSOBA

MORE RULES:
- start with a punchy hook in 1 line
- explain the why fast, then the how in simple steps or a mini example
- sentences 6–14 words so it reads well out loud
- cut filler words and buzzwords
- 1 stat or proof point max, only if useful and specific
- keep it conversational, not salesy
- end with a soft next step
- if i include an image, reference it early and naturally

output format:
title: 3–6 words
hook: one line
script: 90–160 words, single paragraph (MUST include my name Thor/Thor Odinson and reference to GSOBA or my role)
captions: 4–8 short lines that echo key moments
cta: one line, low pressure

input i will provide:
- post text
- optional image and a one line note on what it shows

return only the filled sections in the order above.`;

export default function ScriptEditor({ onScriptGenerated, importedText }: ScriptEditorProps) {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{ text: string; timestamp: Date; isAI?: boolean }[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [masterPrompt, setMasterPrompt] = useState(DEFAULT_MASTER_PROMPT);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (importedText) {
      setInput(importedText);
    }
  }, [importedText]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    // Load custom master prompt from localStorage
    const savedPrompt = localStorage.getItem('MASTER_PROMPT');
    if (savedPrompt) {
      setMasterPrompt(savedPrompt);
    }
  }, []);

  const handleSubmit = async () => {
    if (!input.trim()) return;

    const userMessage = { text: input, timestamp: new Date(), isAI: false };
    setMessages([...messages, userMessage]);
    setLoading(true);

    try {
      // Call OpenAI API to generate script
      const response = await fetch('/api/generate-script', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userInput: input,
          masterPrompt,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate script');
      }

      const data = await response.json();
      const generatedScript = data.script;

      // Add AI response to messages
      const aiMessage = { text: generatedScript, timestamp: new Date(), isAI: true };
      setMessages((prev) => [...prev, aiMessage]);

      // Send generated script to video editor
      onScriptGenerated(generatedScript);
      setInput('');
    } catch (error) {
      console.error('Error generating script:', error);

      // Show error message to user
      const errorMessage = {
        text: `Error: ${error instanceof Error ? error.message : 'Failed to generate script'}. Please check your API key in the .env file.`,
        timestamp: new Date(),
        isAI: true
      };
      setMessages((prev) => [...prev, errorMessage]);
      setInput('');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handlePromptClick = async (prompt: string) => {
    setInput(prompt);

    // Auto-submit the prompt
    const userMessage = { text: prompt, timestamp: new Date(), isAI: false };
    setMessages([userMessage]);
    setLoading(true);

    try {
      // Call OpenAI API to generate script
      const response = await fetch('/api/generate-script', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userInput: prompt,
          masterPrompt,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate script');
      }

      const data = await response.json();
      const generatedScript = data.script;

      // Add AI response to messages
      const aiMessage = { text: generatedScript, timestamp: new Date(), isAI: true };
      setMessages((prev) => [...prev, aiMessage]);

      // Send generated script to video editor
      onScriptGenerated(generatedScript);
      setInput('');
    } catch (error) {
      console.error('Error generating script:', error);

      // Show error message to user
      const errorMessage = {
        text: `Error: ${error instanceof Error ? error.message : 'Failed to generate script'}. Please check your OPEN_AI_API_KEY in the .env file.`,
        timestamp: new Date(),
        isAI: true
      };
      setMessages((prev) => [...prev, errorMessage]);
      setInput('');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = () => {
    localStorage.setItem('MASTER_PROMPT', masterPrompt);
    setShowSettings(false);
  };

  const handleResetPrompt = () => {
    setMasterPrompt(DEFAULT_MASTER_PROMPT);
  };

  return (
    <>
      <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] flex flex-col h-[600px] overflow-hidden border border-slate-200/60">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200/60 bg-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="p-2.5 bg-linkedin-blue rounded-xl shadow-sm">
                  <HiSparkles className="w-5 h-5 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white animate-pulse"></div>
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-800 tracking-tight">Script Writer</h3>
                <p className="text-xs text-slate-500 mt-0.5">Transform ideas into engaging scripts</p>
              </div>
            </div>
            <button
              onClick={() => setShowSettings(true)}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              title="Settings"
            >
              <Settings className="w-5 h-5 text-slate-600" />
            </button>
          </div>
        </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center px-4">
            <div className="w-16 h-16 bg-linkedin-blue/10 rounded-2xl flex items-center justify-center mb-4">
              <HiSparkles className="w-8 h-8 text-linkedin-blue" />
            </div>
            <h4 className="text-sm font-semibold text-slate-700 mb-2">Start Writing</h4>
            <p className="text-xs text-slate-500 text-center leading-relaxed mb-5 max-w-[240px]">
              Choose a prompt below or write your own script
            </p>

            {/* Predefined Prompts */}
            <div className="w-full space-y-2">
              {PREDEFINED_PROMPTS.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handlePromptClick(prompt)}
                  className="w-full text-left px-4 py-3 bg-white hover:bg-linkedin-blue/5 border border-slate-200/60 rounded-xl text-xs text-slate-700 hover:text-linkedin-blue transition-all duration-200 hover:shadow-sm hover:border-linkedin-blue/30 group"
                  style={{
                    animationDelay: `${idx * 50}ms`,
                    animation: 'fadeSlideUp 0.4s ease-out forwards',
                  }}
                >
                  <div className="flex items-center gap-2">
                    <HiSparkles className="w-3.5 h-3.5 text-slate-400 group-hover:text-linkedin-blue transition-colors" />
                    <span className="font-medium">{prompt}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.isAI ? 'justify-start' : 'justify-end'} animate-slideIn`}
              >
                <div className={`max-w-[85%] px-4 py-3 rounded-2xl shadow-md ${
                  msg.isAI
                    ? 'bg-slate-100 text-slate-800 rounded-tl-sm'
                    : 'bg-linkedin-blue text-white rounded-tr-sm'
                }`}>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                  <p className={`text-[10px] mt-1.5 ${msg.isAI ? 'text-slate-500' : 'text-white/70'}`}>
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start animate-slideIn">
                <div className="bg-slate-100 text-slate-800 px-4 py-3 rounded-2xl rounded-tl-sm shadow-md">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                    <span className="text-xs text-slate-500">Generating script...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-slate-200/60 bg-white">
        <div className="relative">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Write your script..."
            disabled={loading}
            className="w-full pl-4 pr-24 py-3 text-sm border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-linkedin-blue/40 focus:border-linkedin-blue resize-none leading-relaxed placeholder:text-slate-400 bg-white shadow-sm transition-all duration-200 disabled:bg-slate-50 disabled:cursor-not-allowed"
            rows={2}
          />
          <div className="absolute right-16 bottom-3.5 text-[10px] text-slate-400 font-medium pointer-events-none">
            {input.length}
          </div>
          <button
            onClick={handleSubmit}
            disabled={!input.trim() || loading}
            className="absolute right-2.5 bottom-2.5 p-2 bg-linkedin-blue text-white rounded-xl hover:bg-linkedin-blue-dark disabled:bg-slate-300 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md disabled:shadow-none"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <ArrowUp className="w-5 h-5" strokeWidth={2.5} />
            )}
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeSlideUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .animate-slideIn {
          animation: slideIn 0.3s ease-out;
        }
      `}</style>
    </div>

    {/* Settings Modal */}
    {showSettings && (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
          {/* Modal Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-linkedin-blue/10 rounded-lg">
                <Settings className="w-5 h-5 text-linkedin-blue" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800">Customize Master Prompt</h3>
                <p className="text-xs text-slate-500">Personalize how the AI writes your scripts</p>
              </div>
            </div>
            <button
              onClick={() => setShowSettings(false)}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-slate-600" />
            </button>
          </div>

          {/* Modal Content */}
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
            {/* Master Prompt Section */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-semibold text-slate-700">
                  Master Prompt
                </label>
                <button
                  onClick={handleResetPrompt}
                  className="text-xs text-linkedin-blue hover:text-linkedin-blue-dark font-semibold transition-colors"
                >
                  Reset to Default
                </button>
              </div>
              <textarea
                value={masterPrompt}
                onChange={(e) => setMasterPrompt(e.target.value)}
                rows={18}
                className="w-full px-4 py-3 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-linkedin-blue/40 focus:border-linkedin-blue resize-none leading-relaxed bg-white shadow-sm transition-all font-mono"
              />
              <p className="mt-2 text-xs text-slate-500">
                This prompt guides how the AI generates scripts. It now includes your name (Thor Odinson), role (Senior Product Manager), and company (GSOBA) for personalized scripts.
              </p>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200 bg-slate-50">
            <button
              onClick={() => setShowSettings(false)}
              className="px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveSettings}
              className="px-4 py-2 text-sm font-semibold bg-linkedin-blue text-white rounded-xl hover:bg-linkedin-blue-dark transition-colors shadow-sm"
            >
              Save Settings
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  );
}
