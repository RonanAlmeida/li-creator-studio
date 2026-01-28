'use client';

import { useState, useRef, useEffect } from 'react';
import { Settings, X, ArrowUp, PenTool, FileText, Wand2, Check, Edit3, RefreshCw, Plus, Maximize2, MessageSquare, Wand, ChevronDown } from 'lucide-react';

interface ScriptEditorProps {
  onScriptGenerated: (script: string) => void;
  importedText?: string;
}

const PREDEFINED_PROMPTS = [
  "Share a behind-the-scenes story from GSOBA",
  "Explain a product feature simply",
  "Share a career lesson learned recently",
  "Discuss an AI industry trend",
  "Celebrate a team win or milestone",
];

const EDIT_OPTIONS = [
  { id: 'rewrite', label: 'Rewrite script', icon: RefreshCw, description: 'Generate a fresh version with different wording' },
  { id: 'shorter', label: 'Make it shorter', icon: ArrowUp, description: 'Condense to under 30 seconds' },
  { id: 'longer', label: 'Make it longer', icon: Plus, description: 'Expand with more details' },
  { id: 'casual', label: 'More casual tone', icon: MessageSquare, description: 'Make it conversational and relaxed' },
  { id: 'professional', label: 'More professional', icon: PenTool, description: 'Polish for corporate audience' },
  { id: 'custom', label: 'Custom edit...', icon: Edit3, description: 'Describe what you want changed' },
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
**TITLE:** 3–6 words that grab attention

**SCRIPT:**
90–160 words, single paragraph (MUST include my name Thor/Thor Odinson and reference to GSOBA or my role)

**HASHTAGS:**
3-5 relevant hashtags for LinkedIn (mix of popular and niche tags like #ProductManagement #AI #GSOBA #Innovation #TechLeadership)

input i will provide:
- post text
- optional image and a one line note on what it shows

return only the filled sections in the order above.`;

export default function ScriptEditor({ onScriptGenerated, importedText }: ScriptEditorProps) {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{ text: string; timestamp: Date; isAI?: boolean }[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showEditDropdown, setShowEditDropdown] = useState(false);
  const [masterPrompt, setMasterPrompt] = useState(DEFAULT_MASTER_PROMPT);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const editDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (importedText) {
      setInput(importedText);
    }
  }, [importedText]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
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
      const response = await fetch('/api/generate-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userInput: input, masterPrompt }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate script');
      }

      const data = await response.json();
      const aiMessage = { text: data.script, timestamp: new Date(), isAI: true };
      setMessages((prev) => [...prev, aiMessage]);
      setInput('');
    } catch (error) {
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
    const userMessage = { text: prompt, timestamp: new Date(), isAI: false };
    setMessages([userMessage]);
    setLoading(true);

    try {
      const response = await fetch('/api/generate-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userInput: prompt, masterPrompt }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate script');
      }

      const data = await response.json();
      const aiMessage = { text: data.script, timestamp: new Date(), isAI: true };
      setMessages((prev) => [...prev, aiMessage]);
      setInput('');
    } catch (error) {
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

  const handleEditOption = (optionId: string) => {
    setShowEditDropdown(false);
    const prompts: Record<string, string> = {
      rewrite: 'Can you rewrite this script with a different angle?',
      shorter: 'Make this script shorter and punchier, under 30 seconds.',
      longer: 'Expand this script with more details and examples.',
      casual: 'Make this more casual and conversational, like I\'m talking to a friend.',
      professional: 'Make this more professional and polished for a corporate audience.',
      custom: '',
    };
    setInput(prompts[optionId] || '');
    textareaRef.current?.focus();
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
      <div className="bg-white rounded-xl shadow-linkedin flex flex-col h-[580px] overflow-hidden border border-linkedin-gray-200">
        {/* Header */}
        <div className="px-4 py-3 border-b border-linkedin-gray-200 bg-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="p-2 bg-linkedin-blue rounded-lg shadow-sm">
                  <PenTool className="w-4 h-4 text-white" />
                </div>
                <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-linkedin-success rounded-full border-2 border-white animate-pulse"></div>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-linkedin-gray-900">AI Script Writer</h3>
                <p className="text-xs text-linkedin-gray-600 mt-0.5">Create engaging video scripts</p>
              </div>
            </div>
            <button
              onClick={() => setShowSettings(true)}
              className="p-2 hover:bg-linkedin-gray-100 rounded-lg transition-colors"
              title="Settings"
            >
              <Settings className="w-4 h-4 text-linkedin-gray-600" />
            </button>
          </div>
        </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center px-3">
            <div className="w-14 h-14 bg-linkedin-blue/10 rounded-xl flex items-center justify-center mb-3">
              <FileText className="w-6 h-6 text-linkedin-blue" />
            </div>
            <h4 className="text-sm font-semibold text-linkedin-gray-900 mb-1.5">Create Your Script</h4>
            <p className="text-xs text-linkedin-gray-600 text-center leading-relaxed mb-4 max-w-[220px]">
              Select a prompt below or describe what you want your video to be about
            </p>

            {/* Predefined Prompts */}
            <div className="w-full space-y-1.5">
              {PREDEFINED_PROMPTS.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handlePromptClick(prompt)}
                  className="w-full text-left px-3 py-2.5 bg-white hover:bg-linkedin-blue/5 border border-linkedin-gray-200 rounded-lg text-xs text-linkedin-gray-700 hover:text-linkedin-blue transition-all duration-200 hover:shadow-sm hover:border-linkedin-blue/30 group"
                >
                  <div className="flex items-center gap-2">
                    <Wand2 className="w-3 h-3 text-linkedin-gray-400 group-hover:text-linkedin-blue transition-colors" />
                    <span className="font-medium">{prompt}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg, idx) => (
              <div key={idx} className="animate-fade-in">
                <div className={`flex ${msg.isAI ? 'justify-start' : 'justify-end'}`}>
                  <div className={`max-w-[90%] px-3 py-2.5 rounded-xl shadow-sm ${
                    msg.isAI
                      ? 'bg-linkedin-gray-100 text-linkedin-gray-900 rounded-tl-sm'
                      : 'bg-linkedin-blue text-white rounded-tr-sm'
                  }`}>
                    <p className="text-xs leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                    <p className={`text-[9px] mt-1 ${msg.isAI ? 'text-linkedin-gray-500' : 'text-white/70'}`}>
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
                {/* AI Response Actions */}
                {msg.isAI && idx === messages.length - 1 && !loading && (
                  <div className="flex justify-start mt-2 ml-1">
                    <div className="flex gap-2">
                      <button
                        onClick={() => onScriptGenerated(msg.text)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-linkedin-blue text-white text-xs font-semibold rounded-full hover:bg-linkedin-blue-dark transition-all shadow-sm hover:shadow"
                      >
                        <Check className="w-3.5 h-3.5" />
                        Use This Script
                      </button>
                      <div className="relative" ref={editDropdownRef}>
                        <button
                          onClick={() => setShowEditDropdown(!showEditDropdown)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-linkedin-gray-300 text-linkedin-gray-700 text-xs font-semibold rounded-full hover:bg-linkedin-gray-50 hover:border-linkedin-gray-400 transition-all"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          Edit More
                          <ChevronDown className={`w-3 h-3 transition-transform ${showEditDropdown ? 'rotate-180' : ''}`} />
                        </button>
                        {showEditDropdown && (
                          <div className="absolute top-full left-0 mt-1 w-56 bg-white border border-linkedin-gray-200 rounded-xl shadow-lg z-10 overflow-hidden">
                            {EDIT_OPTIONS.map((option) => (
                              <button
                                key={option.id}
                                onClick={() => handleEditOption(option.id)}
                                className="w-full flex items-center gap-2 px-3 py-2 hover:bg-linkedin-gray-50 transition-colors text-left"
                              >
                                <option.icon className="w-3.5 h-3.5 text-linkedin-gray-500" />
                                <span className="text-xs text-linkedin-gray-700">{option.label}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div className="flex justify-start animate-fade-in">
                <div className="bg-linkedin-gray-100 text-linkedin-gray-900 px-3 py-2.5 rounded-xl rounded-tl-sm shadow-sm">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <div className="w-1.5 h-1.5 bg-linkedin-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-1.5 h-1.5 bg-linkedin-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-1.5 h-1.5 bg-linkedin-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                    <span className="text-[10px] text-linkedin-gray-600">Writing your script...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input Area */}
      <div className="p-3 border-t border-linkedin-gray-200 bg-white">
        <div className="space-y-2">
          <div className="relative">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Describe your video idea..."
              className="w-full px-3 py-2.5 pr-10 text-xs border border-linkedin-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-linkedin-blue/40 focus:border-linkedin-blue resize-none leading-relaxed placeholder:text-linkedin-gray-400 bg-white shadow-sm transition-all duration-200"
              rows={2}
            />
            {loading && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <div className="w-4 h-4 border-2 border-linkedin-blue border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </div>
          <div className="flex items-center justify-between">
            <div className="text-[9px] text-linkedin-gray-400 font-medium">
              {input.length} characters
            </div>
            <button
              onClick={handleSubmit}
              disabled={!input.trim() || loading}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-linkedin-blue text-white text-xs font-medium rounded-lg hover:bg-linkedin-blue-dark disabled:bg-linkedin-gray-300 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
            >
              {loading ? (
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <ArrowUp className="w-3.5 h-3.5" strokeWidth={2.5} />
              )}
              <span>Send</span>
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .animate-slideIn { animation: slideIn 0.3s ease-out; }
      `}</style>
    </div>

    {/* Settings Modal */}
    {showSettings && (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-6 py-4 border-b border-linkedin-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-linkedin-blue/10 rounded-lg">
                <Settings className="w-5 h-5 text-linkedin-blue" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-linkedin-gray-900">Customize Master Prompt</h3>
                <p className="text-xs text-linkedin-gray-500">Personalize how the AI writes your scripts</p>
              </div>
            </div>
            <button
              onClick={() => setShowSettings(false)}
              className="p-2 hover:bg-linkedin-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-linkedin-gray-600" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-semibold text-linkedin-gray-700">Master Prompt</label>
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
                className="w-full px-4 py-3 text-xs border border-linkedin-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-linkedin-blue/40 focus:border-linkedin-blue resize-none leading-relaxed bg-white shadow-sm transition-all font-mono"
              />
              <p className="mt-2 text-xs text-linkedin-gray-500">
                This prompt guides how the AI generates scripts. It now includes your name (Thor Odinson), role (Senior Product Manager), and company (GSOBA) for personalized scripts.
              </p>
            </div>
          </div>
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-linkedin-gray-200 bg-linkedin-gray-50">
            <button
              onClick={() => setShowSettings(false)}
              className="px-4 py-2 text-sm font-semibold text-linkedin-gray-700 hover:bg-linkedin-gray-200 rounded-xl transition-colors"
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
