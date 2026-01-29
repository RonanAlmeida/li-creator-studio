'use client';

import { useState, useRef, useEffect } from 'react';
import { Settings, X, ArrowUp, PenTool, FileText, Wand2, Check, Edit3, RefreshCw, Plus, Maximize2, MessageSquare, Wand, ChevronDown, Sparkles, ThumbsUp, ChevronLeft, ChevronRight, Video } from 'lucide-react';
import type { Post } from './PostLibrary';

interface ScriptEditorProps {
  onScriptGenerated: (script: string) => void;
  importedText?: string;
  importedPost?: Post;
}

const QUICK_START_PROMPTS = [
  "Generate 5 video ideas about AI tools for creators",
  "Give me video ideas about product management tips",
  "Suggest viral video ideas for LinkedIn",
  "What are trending topics I should create videos about?",
  "Generate video ideas about GSOBA features",
  "Share a behind-the-scenes story from GSOBA",
];

const EDIT_OPTIONS = [
  { id: 'rewrite', label: 'Rewrite script', icon: RefreshCw, description: 'Generate a fresh version with different wording' },
  { id: 'shorter', label: 'Make it shorter', icon: ArrowUp, description: 'Condense to under 30 seconds' },
  { id: 'longer', label: 'Make it longer', icon: Plus, description: 'Expand with more details' },
  { id: 'casual', label: 'More casual tone', icon: MessageSquare, description: 'Make it conversational and relaxed' },
  { id: 'professional', label: 'More professional', icon: PenTool, description: 'Polish for corporate audience' },
  { id: 'custom', label: 'Custom edit...', icon: Edit3, description: 'Describe what you want changed' },
];

const DEFAULT_MASTER_PROMPT = `you are my linkedin video script writer. i create content about product management, AI tools, and tech leadership.

take my post text (and optional image) and turn it into a tight, human script for short videos. write in plain english, high signal, authentic voice. target 20–60 seconds. focus on one idea.

RULES:
- start with a punchy hook in 1 line
- explain the why fast, then the how in simple steps or a mini example
- sentences 6–14 words so it reads well out loud
- cut filler words and buzzwords
- 1 stat or proof point max, only if useful and specific
- keep it conversational, not salesy
- end with a soft next step
- if i include an image, reference it early and naturally
- use specific examples and real scenarios when relevant
- avoid generic corporate cliches

output format (CRITICAL - follow this exact structure):
TITLE: 3–6 words that grab attention

SCRIPT:
90–160 words, natural conversational tone, formatted as a single flowing paragraph

HASHTAGS:
3-5 relevant hashtags for LinkedIn (mix of popular and niche tags like #ProductManagement #AI #TechLeadership #Innovation)

input i will provide:
- post text
- optional image and a one line note on what it shows

IMPORTANT: Always return all three sections: TITLE, SCRIPT, and HASHTAGS in the exact format above.`;

interface ParsedScript {
  title: string;
  script: string;
  hashtags: string[];
  raw: string;
}

interface VideoIdea {
  number: number;
  title: string;
  description: string;
  whyEngaging: string;
}

function parseScriptResponse(text: string): ParsedScript {
  const titleMatch = text.match(/TITLE:\s*(.+?)(?=\n|$)/i);
  const scriptMatch = text.match(/SCRIPT:\s*(.+?)(?=HASHTAGS:|$)/is);
  const hashtagsMatch = text.match(/HASHTAGS:\s*(.+?)$/is);

  const title = titleMatch ? titleMatch[1].trim().replace(/^["*]+|["*]+$/g, '') : '';
  const script = scriptMatch ? scriptMatch[1].trim() : '';
  const hashtagsText = hashtagsMatch ? hashtagsMatch[1].trim() : '';
  const hashtags = hashtagsText ? hashtagsText.split(/[,\s]+/).filter(tag => tag.startsWith('#')) : [];

  return { title, script, hashtags, raw: text };
}

function parseVideoIdeas(text: string): VideoIdea[] | null {
  // Check if this looks like a video ideas response
  const hasNumberedList = /^\d+\.\s+\*\*Title:/im.test(text);
  if (!hasNumberedList) return null;

  const ideas: VideoIdea[] = [];
  const ideaBlocks = text.split(/(?=\d+\.\s+\*\*Title:)/);

  ideaBlocks.forEach((block) => {
    if (!block.trim()) return;

    const numberMatch = block.match(/^(\d+)\./);
    const titleMatch = block.match(/\*\*Title:\*\*\s*["""]?([^"""\n]+)["""]?/i);
    const descMatch = block.match(/\*\*Description:\*\*\s*(.+?)(?=\n\s*\*\*Why)/is);
    const whyMatch = block.match(/\*\*Why Engaging:\*\*\s*(.+?)(?=\n\n\d+\.|\n*$)/is);

    if (numberMatch && titleMatch) {
      ideas.push({
        number: parseInt(numberMatch[1]),
        title: titleMatch[1].trim(),
        description: descMatch ? descMatch[1].trim() : '',
        whyEngaging: whyMatch ? whyMatch[1].trim() : ''
      });
    }
  });

  return ideas.length > 0 ? ideas : null;
}

export default function ScriptEditor({ onScriptGenerated, importedText, importedPost }: ScriptEditorProps) {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{ text: string; timestamp: Date; isAI?: boolean; post?: Post }[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showEditDropdown, setShowEditDropdown] = useState(false);
  const [masterPrompt, setMasterPrompt] = useState(DEFAULT_MASTER_PROMPT);
  const [lastGeneratedScript, setLastGeneratedScript] = useState('');
  const [carouselIndex, setCarouselIndex] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const editDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (importedText) {
      setInput(importedText);
    }
  }, [importedText]);

  useEffect(() => {
    if (importedPost) {
      const postMessage = {
        text: '', // Empty text since we're showing the post component
        timestamp: new Date(),
        isAI: false,
        post: importedPost
      };
      setMessages([postMessage]);
      setLoading(true);

      // Auto-submit to generate video ideas
      setTimeout(() => {
        fetch('/api/generate-script', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userInput: `Generate 5 creative video ideas I could make based on this LinkedIn post:\n\n"${importedPost.content}"\n\nFor each idea, use this exact format:\n\n1. **Title:** "Your catchy title here"\n\n   **Description:** Your description here\n\n   **Why Engaging:** Explanation here\n\n2. **Title:** "Next title"\n\n   **Description:** Next description\n\n   **Why Engaging:** Next explanation\n\nAnd so on for all 5 ideas.`,
            masterPrompt
          }),
        })
          .then(async (response) => {
            if (!response.ok) throw new Error('Failed to generate ideas');
            const data = await response.json();
            const aiMessage = { text: data.script, timestamp: new Date(), isAI: true };
            setMessages((prev) => [...prev, aiMessage]);
            setLastGeneratedScript(data.script);
          })
          .catch((error) => {
            const errorMessage = {
              text: `Error: ${error instanceof Error ? error.message : 'Failed to generate ideas'}`,
              timestamp: new Date(),
              isAI: true
            };
            setMessages((prev) => [...prev, errorMessage]);
          })
          .finally(() => {
            setLoading(false);
          });
      }, 300);
    }
  }, [importedPost, masterPrompt]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    setCarouselIndex(0); // Reset carousel to first item on new messages
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
    setInput(''); // Clear input immediately

    try {
      // Check if this is an /edit command
      let finalUserInput = input;
      if (input.toLowerCase().startsWith('/edit')) {
        const editInstruction = input.substring(5).trim(); // Remove "/edit " prefix
        if (lastGeneratedScript) {
          finalUserInput = `I have a script that I want you to edit. Here is the current script:\n\n${lastGeneratedScript}\n\nPlease modify it based on this instruction: ${editInstruction}\n\nReturn the edited version in the same format (TITLE, SCRIPT, HASHTAGS).`;
        } else {
          finalUserInput = editInstruction;
        }
      }

      const response = await fetch('/api/generate-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userInput: finalUserInput, masterPrompt }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate script');
      }

      const data = await response.json();
      const aiMessage = { text: data.script, timestamp: new Date(), isAI: true };
      setMessages((prev) => [...prev, aiMessage]);
      setLastGeneratedScript(data.script); // Save for future /edit commands
    } catch (error) {
      const errorMessage = {
        text: `Error: ${error instanceof Error ? error.message : 'Failed to generate script'}. Please check your API key in the .env file.`,
        timestamp: new Date(),
        isAI: true
      };
      setMessages((prev) => [...prev, errorMessage]);
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
    console.log('Button clicked with prompt:', prompt);
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
      setLastGeneratedScript(data.script); // Save for future /edit commands
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
      rewrite: '/edit rewrite this script with a different angle',
      shorter: '/edit make this script shorter and punchier, under 30 seconds',
      longer: '/edit expand this script with more details and examples',
      casual: '/edit make this more casual and conversational',
      professional: '/edit make this more professional and polished for a corporate audience',
      custom: '/edit ',
    };
    const promptText = prompts[optionId] || '';
    setInput(promptText);
    textareaRef.current?.focus();

    // If not custom, auto-submit
    if (optionId !== 'custom' && promptText) {
      setTimeout(() => {
        handleSubmit();
      }, 100);
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
      <div className="bg-white rounded-xl shadow-linkedin flex flex-col h-[600px] overflow-hidden border border-linkedin-gray-200">
        {/* Header */}
        <div className="px-4 py-2.5 border-b border-linkedin-gray-200 bg-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <div className="p-1.5 bg-linkedin-blue rounded-lg shadow-sm">
                  <PenTool className="w-4 h-4 text-white" />
                </div>
                <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-linkedin-success rounded-full border-2 border-white animate-pulse"></div>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-linkedin-gray-900">AI Script Writer</h3>
                <p className="text-[11px] text-linkedin-gray-600 mt-0.5">Create engaging video scripts</p>
              </div>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                console.log('Settings button clicked');
                setShowSettings(true);
              }}
              className="p-2 hover:bg-linkedin-gray-100 rounded-lg transition-colors cursor-pointer"
              title="Settings"
            >
              <Settings className="w-4 h-4 text-linkedin-gray-600" />
            </button>
          </div>
        </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col justify-start px-2 py-3">
            <div className="w-12 h-12 bg-linkedin-blue/10 rounded-xl flex items-center justify-center mb-2 mx-auto">
              <Sparkles className="w-5 h-5 text-linkedin-blue" />
            </div>
            <h4 className="text-sm font-semibold text-linkedin-gray-900 mb-1 text-center">Quick Start</h4>
            <p className="text-xs text-linkedin-gray-600 text-center leading-relaxed mb-4 max-w-[280px] mx-auto">
              Generate video ideas or create a script with one click
            </p>

            {/* Quick Start Prompts */}
            <div className="w-full">
              <div className="space-y-2">
                {QUICK_START_PROMPTS.map((prompt, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      handlePromptClick(prompt);
                    }}
                    className="w-full text-left px-3 py-2 bg-gradient-to-r from-linkedin-blue/5 to-transparent hover:from-linkedin-blue/10 hover:to-linkedin-blue/5 border border-linkedin-gray-200 rounded-lg text-xs text-linkedin-gray-700 hover:text-linkedin-blue transition-all duration-200 hover:shadow-sm hover:border-linkedin-blue/30 group cursor-pointer"
                  >
                    <div className="flex items-center gap-2 pointer-events-none">
                      <Sparkles className="w-3 h-3 text-linkedin-blue/60 group-hover:text-linkedin-blue transition-colors" />
                      <span className="font-medium">{prompt}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg, idx) => {
              const parsedScript = msg.isAI ? parseScriptResponse(msg.text) : null;
              const videoIdeas = msg.isAI ? parseVideoIdeas(msg.text) : null;
              const isScriptResponse = parsedScript && parsedScript.title && parsedScript.script && !videoIdeas;

              return (
              <div key={idx} className="animate-fade-in">
                <div className={`flex ${msg.isAI ? 'justify-start' : 'justify-end'}`}>
                  {msg.post ? (
                    // LinkedIn Post Component
                    <div className="max-w-[95%] bg-white border border-linkedin-gray-200 rounded-xl shadow-md overflow-hidden">
                      {/* Post Header */}
                      <div className="px-4 py-3 border-b border-linkedin-gray-200 bg-linkedin-gray-50">
                        <div className="flex items-center gap-2.5">
                          <div className="w-10 h-10 rounded-full bg-linkedin-gray-300 flex-shrink-0 overflow-hidden">
                            <img
                              src="https://i.pravatar.cc/150?img=12"
                              alt={msg.post.author}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <h4 className="text-xs font-semibold text-linkedin-gray-900">{msg.post.author}</h4>
                            <p className="text-[10px] text-linkedin-gray-600">{msg.post.role}</p>
                          </div>
                        </div>
                      </div>

                      {/* Post Content */}
                      <div className="px-4 py-3 bg-white">
                        <p className="text-xs leading-relaxed text-linkedin-gray-800 whitespace-pre-wrap">
                          {msg.post.content}
                        </p>
                      </div>

                      {/* Post Image */}
                      {msg.post.image && (
                        <div className="overflow-hidden">
                          <img
                            src={msg.post.image}
                            alt="Post content"
                            className="w-full h-40 object-cover"
                          />
                        </div>
                      )}

                      {/* Engagement Stats */}
                      <div className="px-4 py-2.5 bg-linkedin-gray-50 border-t border-linkedin-gray-200 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="flex -space-x-1">
                            <div className="w-4 h-4 rounded-full bg-linkedin-blue flex items-center justify-center border border-white">
                              <ThumbsUp className="w-2 h-2 fill-white text-white" />
                            </div>
                            <div className="w-4 h-4 rounded-full bg-red-500 flex items-center justify-center border border-white">
                              <span className="text-[9px]">❤️</span>
                            </div>
                          </div>
                          <span className="text-[10px] text-linkedin-gray-600">{msg.post.likes.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center gap-1 text-[10px] text-linkedin-gray-600">
                          <MessageSquare className="w-3 h-3" />
                          <span>{msg.post.comments}</span>
                        </div>
                      </div>

                      {/* Timestamp */}
                      <div className="px-4 py-1.5 bg-linkedin-gray-50 border-t border-linkedin-gray-200">
                        <p className="text-[9px] text-linkedin-gray-500">
                          {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  ) : videoIdeas ? (
                    // Video Ideas Carousel
                    <div className="max-w-[95%] w-full">
                      <div className="bg-white border border-linkedin-gray-200 rounded-xl shadow-md overflow-hidden">
                        {/* Carousel Header */}
                        <div className="bg-white border-b border-linkedin-gray-200 px-4 py-3 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Video className="w-4 h-4 text-linkedin-blue" />
                            <h3 className="text-sm font-bold text-linkedin-gray-900">Video Ideas</h3>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-linkedin-gray-600">{carouselIndex + 1} of {videoIdeas.length}</span>
                            <div className="flex gap-1">
                              <button
                                type="button"
                                onClick={() => setCarouselIndex(Math.max(0, carouselIndex - 1))}
                                disabled={carouselIndex === 0}
                                className="p-1 rounded hover:bg-linkedin-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                              >
                                <ChevronLeft className="w-4 h-4 text-linkedin-gray-700" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setCarouselIndex(Math.min(videoIdeas.length - 1, carouselIndex + 1))}
                                disabled={carouselIndex === videoIdeas.length - 1}
                                className="p-1 rounded hover:bg-linkedin-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                              >
                                <ChevronRight className="w-4 h-4 text-linkedin-gray-700" />
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Carousel Content */}
                        <div className="relative overflow-hidden">
                          <div
                            className="flex transition-transform duration-300 ease-out"
                            style={{ transform: `translateX(-${carouselIndex * 100}%)` }}
                          >
                            {videoIdeas.map((idea) => (
                              <div key={idea.number} className="min-w-full px-4 py-4">
                                <div className="space-y-3">
                                  {/* Idea Number Badge */}
                                  <div className="flex items-center gap-2">
                                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-linkedin-blue text-white text-xs font-bold">
                                      {idea.number}
                                    </span>
                                    <h4 className="text-sm font-bold text-linkedin-gray-900">{idea.title}</h4>
                                  </div>

                                  {/* Description */}
                                  <div className="bg-linkedin-gray-50 rounded-lg p-3">
                                    <p className="text-xs text-linkedin-gray-700 leading-relaxed">
                                      {idea.description}
                                    </p>
                                  </div>

                                  {/* Why Engaging */}
                                  <div className="border-l-2 border-linkedin-blue pl-3">
                                    <p className="text-[10px] font-semibold text-linkedin-blue mb-1">Why This Works</p>
                                    <p className="text-xs text-linkedin-gray-700 leading-relaxed">
                                      {idea.whyEngaging}
                                    </p>
                                  </div>

                                  {/* Action Button */}
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      // Find the original post content from messages
                                      const postMessage = messages.find(m => m.post);
                                      const postContext = postMessage?.post
                                        ? `\n\nOriginal Post Context:\n"${postMessage.post.content}"\n\n`
                                        : '';

                                      const fullPrompt = `Write a full video script based on this idea:\n\nTitle: ${idea.title}\n\nDescription: ${idea.description}\n\nWhy It Works: ${idea.whyEngaging}${postContext}`;
                                      setInput(fullPrompt);
                                      textareaRef.current?.focus();
                                    }}
                                    className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-linkedin-blue text-white text-xs font-semibold rounded-lg hover:bg-linkedin-blue-dark transition-all shadow-sm"
                                  >
                                    <PenTool className="w-3.5 h-3.5" />
                                    <span>Create Script for This Idea</span>
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Carousel Dots */}
                        <div className="px-4 py-3 bg-linkedin-gray-50 border-t border-linkedin-gray-200 flex items-center justify-center gap-1.5">
                          {videoIdeas.map((_, i) => (
                            <button
                              key={i}
                              type="button"
                              onClick={() => setCarouselIndex(i)}
                              className={`w-1.5 h-1.5 rounded-full transition-all ${
                                i === carouselIndex ? 'bg-linkedin-blue w-4' : 'bg-linkedin-gray-300'
                              }`}
                            />
                          ))}
                        </div>

                        {/* Timestamp */}
                        <div className="px-4 py-2 bg-linkedin-gray-50 border-t border-linkedin-gray-200">
                          <p className="text-[9px] text-linkedin-gray-500">
                            {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : msg.isAI && isScriptResponse ? (
                    // Formatted Script Card
                    <div className="max-w-[95%] bg-white border border-linkedin-gray-200 rounded-xl shadow-md overflow-hidden">
                      {/* Caption/Title Section */}
                      <div className="bg-linkedin-gray-50 border-b border-linkedin-gray-300 px-4 py-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] font-semibold text-linkedin-gray-500 uppercase tracking-wide">Caption Text</span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              setInput(`/edit title: ${parsedScript.title}`);
                              textareaRef.current?.focus();
                            }}
                            className="text-[10px] text-linkedin-blue hover:text-linkedin-blue-dark font-semibold transition-colors cursor-pointer"
                          >
                            Edit
                          </button>
                        </div>
                        <h3 className="text-sm font-bold text-linkedin-gray-900">{parsedScript.title}</h3>
                      </div>

                      {/* Script Body Section */}
                      <div className="border-b border-linkedin-gray-300">
                        <div className="px-4 py-3 bg-linkedin-gray-50 border-b border-linkedin-gray-200">
                          <span className="text-[10px] font-semibold text-linkedin-gray-500 uppercase tracking-wide">Script Body</span>
                        </div>
                        <div className="px-4 py-5 bg-white min-h-[300px] max-h-[600px] overflow-y-auto">
                          <p className="text-sm leading-relaxed text-linkedin-gray-800 whitespace-pre-wrap">
                            {parsedScript.script}
                          </p>
                        </div>
                      </div>

                      {/* Hashtags Section */}
                      {parsedScript.hashtags.length > 0 && (
                        <div className="border-b border-linkedin-gray-300">
                          <div className="px-4 py-3 bg-linkedin-gray-50 border-b border-linkedin-gray-200">
                            <span className="text-[10px] font-semibold text-linkedin-gray-500 uppercase tracking-wide">Hashtags</span>
                          </div>
                          <div className="px-4 py-3 bg-white">
                            <div className="flex flex-wrap gap-1.5">
                              {parsedScript.hashtags.map((tag, i) => (
                                <span
                                  key={i}
                                  className="inline-block px-2.5 py-1 text-[10px] font-semibold text-linkedin-blue bg-linkedin-blue/10 rounded-full"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Actions Section - Only show for the last message */}
                      {idx === messages.length - 1 && !loading && (
                        <>
                          <div className="border-t border-linkedin-gray-300"></div>
                          <div className="px-4 py-3 bg-white">
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  console.log('Use This Script clicked');
                                  // Pass the full formatted script with title, script, and hashtags
                                  const hashtagsString = parsedScript.hashtags.length > 0
                                    ? `\n\n${parsedScript.hashtags.join(' ')}`
                                    : '';
                                  const formattedScript = `${parsedScript.title}\n\n${parsedScript.script}${hashtagsString}`;
                                  onScriptGenerated(formattedScript);
                                }}
                                className="flex items-center gap-1.5 px-4 py-2 bg-linkedin-blue text-white text-xs font-semibold rounded-full hover:bg-linkedin-blue-dark transition-all shadow-sm hover:shadow cursor-pointer"
                              >
                                <Check className="w-3.5 h-3.5" />
                                Use This Script
                              </button>
                              <div className="relative" ref={editDropdownRef}>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    console.log('Edit More clicked');
                                    setShowEditDropdown(!showEditDropdown);
                                  }}
                                  className="flex items-center gap-1.5 px-4 py-2 bg-white border border-linkedin-gray-300 text-linkedin-gray-700 text-xs font-semibold rounded-full hover:bg-linkedin-gray-50 hover:border-linkedin-gray-400 transition-all cursor-pointer"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                  Edit More
                                  <ChevronDown className={`w-3 h-3 transition-transform ${showEditDropdown ? 'rotate-180' : ''}`} />
                                </button>
                                {showEditDropdown && (
                                  <div className="absolute bottom-full left-0 mb-1 w-56 bg-white border border-linkedin-gray-200 rounded-xl shadow-lg z-10 overflow-hidden">
                                    {EDIT_OPTIONS.map((option) => (
                                      <button
                                        key={option.id}
                                        type="button"
                                        onClick={(e) => {
                                          e.preventDefault();
                                          console.log('Edit option clicked:', option.id);
                                          handleEditOption(option.id);
                                        }}
                                        className="w-full flex items-center gap-2 px-3 py-2 hover:bg-linkedin-gray-50 transition-colors text-left cursor-pointer"
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
                        </>
                      )}
                    </div>
                  ) : (
                    // Regular Message Bubble
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
                  )}
                </div>
              </div>
            );
            })}
            {loading && (
              <div className="flex justify-start animate-fade-in">
                <div className="max-w-[95%] bg-white border border-linkedin-gray-200 rounded-xl shadow-md overflow-hidden">
                  {/* Caption/Title Skeleton */}
                  <div className="bg-linkedin-gray-50 border-b border-linkedin-gray-300 px-4 py-3 relative overflow-hidden">
                    <div className="h-2 bg-linkedin-gray-200 rounded w-20 mb-2 relative z-10"></div>
                    <div className="h-3 bg-linkedin-gray-200 rounded w-2/3 relative z-10"></div>
                    <div className="absolute inset-0 shimmer-effect"></div>
                  </div>

                  {/* Script Body Skeleton */}
                  <div className="border-b border-linkedin-gray-300">
                    <div className="px-4 py-3 bg-linkedin-gray-50 border-b border-linkedin-gray-200 relative overflow-hidden">
                      <div className="h-2 bg-linkedin-gray-200 rounded w-20 relative z-10"></div>
                      <div className="absolute inset-0 shimmer-effect"></div>
                    </div>
                    <div className="px-4 py-4 bg-white space-y-2.5 relative overflow-hidden min-h-[200px]">
                      <div className="h-2 bg-linkedin-gray-200 rounded w-full relative z-10"></div>
                      <div className="h-2 bg-linkedin-gray-200 rounded w-11/12 relative z-10"></div>
                      <div className="h-2 bg-linkedin-gray-200 rounded w-full relative z-10"></div>
                      <div className="h-2 bg-linkedin-gray-200 rounded w-10/12 relative z-10"></div>
                      <div className="h-2 bg-linkedin-gray-200 rounded w-full relative z-10"></div>
                      <div className="h-2 bg-linkedin-gray-200 rounded w-9/12 relative z-10"></div>
                      <div className="h-2 bg-linkedin-gray-200 rounded w-full relative z-10"></div>
                      <div className="h-2 bg-linkedin-gray-200 rounded w-8/12 relative z-10"></div>
                      <div className="absolute inset-0 shimmer-effect"></div>
                    </div>
                  </div>

                  {/* Hashtags Skeleton */}
                  <div className="border-b border-linkedin-gray-300">
                    <div className="px-4 py-3 bg-linkedin-gray-50 border-b border-linkedin-gray-200 relative overflow-hidden">
                      <div className="h-2 bg-linkedin-gray-200 rounded w-16 relative z-10"></div>
                      <div className="absolute inset-0 shimmer-effect"></div>
                    </div>
                    <div className="px-4 py-3 bg-white flex gap-2 relative overflow-hidden">
                      <div className="h-5 w-16 bg-linkedin-gray-200 rounded-full relative z-10"></div>
                      <div className="h-5 w-20 bg-linkedin-gray-200 rounded-full relative z-10"></div>
                      <div className="h-5 w-14 bg-linkedin-gray-200 rounded-full relative z-10"></div>
                      <div className="absolute inset-0 shimmer-effect"></div>
                    </div>
                  </div>

                  {/* Status */}
                  <div className="px-4 py-2 bg-linkedin-gray-50 border-t border-linkedin-gray-200">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        <div className="w-1 h-1 bg-linkedin-blue rounded-full animate-pulse" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-1 h-1 bg-linkedin-blue rounded-full animate-pulse" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-1 h-1 bg-linkedin-blue rounded-full animate-pulse" style={{ animationDelay: '300ms' }}></div>
                      </div>
                      <span className="text-[9px] text-linkedin-gray-500">Generating your script</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input Area */}
      <div className="p-2.5 border-t border-linkedin-gray-200 bg-white">
        <div className="space-y-1.5">
          <div className="relative">
            {/* /edit command pill indicator */}
            {input.toLowerCase().startsWith('/edit') && (
              <div className="absolute top-2 left-2 z-10 flex items-center gap-1.5 px-2 py-1 bg-linkedin-blue/10 border border-linkedin-blue/30 rounded-full">
                <Edit3 className="w-3 h-3 text-linkedin-blue" />
                <span className="text-[10px] font-semibold text-linkedin-blue">EDIT MODE</span>
              </div>
            )}
            <textarea
              ref={textareaRef}
              value={loading ? '' : input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={lastGeneratedScript ? "Type /edit to modify the script, or ask for something new..." : "Ask for video ideas or describe what you want your script to be about..."}
              className={`w-full px-3 py-2 pr-10 text-xs border border-linkedin-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-linkedin-blue/40 focus:border-linkedin-blue resize-none leading-relaxed placeholder:text-linkedin-gray-400 bg-white shadow-sm transition-all duration-200 ${
                input.toLowerCase().startsWith('/edit') ? 'pt-9' : ''
              }`}
              rows={2}
              disabled={loading}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="text-[9px] text-linkedin-gray-400 font-medium">
              {input.length} characters
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                console.log('Send button clicked');
                handleSubmit();
              }}
              disabled={!input.trim() || loading}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-linkedin-blue text-white text-xs font-medium rounded-lg hover:bg-linkedin-blue-dark disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm cursor-pointer"
            >
              {loading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Sending...</span>
                </>
              ) : (
                <>
                  <ArrowUp className="w-3.5 h-3.5" strokeWidth={2.5} />
                  <span>Send</span>
                </>
              )}
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
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-slideIn { animation: slideIn 0.3s ease-out; }
        .shimmer-effect {
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.6),
            transparent
          );
          animation: shimmer 2s infinite;
        }
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
              type="button"
              onClick={(e) => {
                e.preventDefault();
                setShowSettings(false);
              }}
              className="p-2 hover:bg-linkedin-gray-100 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5 text-linkedin-gray-600" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-semibold text-linkedin-gray-700">Master Prompt</label>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    handleResetPrompt();
                  }}
                  className="text-xs text-linkedin-blue hover:text-linkedin-blue-dark font-semibold transition-colors cursor-pointer"
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
                This prompt guides how the AI generates scripts. 
              </p>
            </div>
          </div>
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-linkedin-gray-200 bg-linkedin-gray-50">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                setShowSettings(false);
              }}
              className="px-4 py-2 text-sm font-semibold text-linkedin-gray-700 hover:bg-linkedin-gray-200 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                handleSaveSettings();
              }}
              className="px-4 py-2 text-sm font-semibold bg-linkedin-blue text-white rounded-xl hover:bg-linkedin-blue-dark transition-colors shadow-sm cursor-pointer"
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
