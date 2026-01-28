'use client';

import { useState, useEffect } from 'react';
import { TEXT_LIMITS } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { FileText, Maximize2, X } from 'lucide-react';

interface TextInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  maxLength?: number;
  showCounter?: boolean;
  error?: string;
  className?: string;
  label?: string;
}

export default function TextInput({
  value,
  onChange,
  placeholder = 'Enter your text here...',
  rows = 14,
  maxLength = TEXT_LIMITS.max,
  showCounter = true,
  error,
  className,
  label = 'Video Script',
}: TextInputProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const isNearLimit = value.length > maxLength * 0.9;
  const isOverLimit = value.length > maxLength;

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isExpanded) {
        setIsExpanded(false);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isExpanded]);

  return (
    <>
      <div className={cn('w-full bg-white rounded-xl border border-linkedin-gray-200 overflow-hidden shadow-sm', className)}>
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-linkedin-gray-50 border-b border-linkedin-gray-200">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-linkedin-blue" />
            <span className="text-sm font-semibold text-linkedin-gray-900">{label}</span>
          </div>
          <button
            onClick={() => setIsExpanded(true)}
            className="p-1.5 hover:bg-linkedin-gray-200 rounded-lg transition-colors"
            title="Expand editor"
          >
            <Maximize2 className="w-4 h-4 text-linkedin-gray-600" />
          </button>
        </div>
        
        {/* Text Area */}
        <div className="p-4">
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            rows={rows}
            maxLength={maxLength}
            className={cn(
              'w-full px-0 py-0 text-base leading-relaxed resize-none focus:outline-none',
              'placeholder:text-linkedin-gray-400 text-linkedin-gray-900',
              error && 'text-linkedin-error'
            )}
          />
        </div>
        
        {/* Footer with counter */}
        <div className="flex justify-between items-center px-4 py-2 bg-linkedin-gray-50 border-t border-linkedin-gray-200">
          {error ? (
            <span className="text-xs text-linkedin-error">{error}</span>
          ) : (
            <span className="text-xs text-linkedin-gray-500">
              Write your video script here
            </span>
          )}
          {showCounter && (
            <span
              className={cn(
                'text-xs font-medium tabular-nums',
                isOverLimit
                  ? 'text-linkedin-error'
                  : isNearLimit
                  ? 'text-amber-600'
                  : 'text-linkedin-gray-600'
              )}
            >
              {value.length.toLocaleString()} / {maxLength.toLocaleString()}
            </span>
          )}
        </div>
      </div>

      {/* Expanded Modal - Notion Style */}
      {isExpanded && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-linkedin-gray-200 bg-linkedin-gray-50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-linkedin-blue/10 rounded-lg">
                  <FileText className="w-5 h-5 text-linkedin-blue" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-linkedin-gray-900">{label}</h2>
                  <p className="text-xs text-linkedin-gray-500">Focus mode • Distraction-free writing</p>
                </div>
              </div>
              <button
                onClick={() => setIsExpanded(false)}
                className="p-2 hover:bg-linkedin-gray-200 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-linkedin-gray-600" />
              </button>
            </div>
            
            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-8 bg-white">
              <textarea
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                rows={20}
                maxLength={maxLength}
                autoFocus
                className={cn(
                  'w-full text-lg leading-relaxed resize-none focus:outline-none',
                  'placeholder:text-linkedin-gray-300 text-linkedin-gray-900',
                  'min-h-[400px]'
                )}
              />
            </div>
            
            {/* Modal Footer */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-linkedin-gray-200 bg-linkedin-gray-50">
              <div className="flex items-center gap-4 text-sm text-linkedin-gray-500">
                <span>Press <kbd className="px-1.5 py-0.5 bg-white border border-linkedin-gray-300 rounded text-xs">Esc</kbd> to close</span>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={cn(
                    'text-sm font-medium tabular-nums',
                    isOverLimit
                      ? 'text-linkedin-error'
                      : isNearLimit
                      ? 'text-amber-600'
                      : 'text-linkedin-gray-600'
                  )}
                >
                  {value.length.toLocaleString()} / {maxLength.toLocaleString()}
                </span>
                <button
                  onClick={() => setIsExpanded(false)}
                  className="px-4 py-2 bg-linkedin-blue text-white text-sm font-semibold rounded-lg hover:bg-linkedin-blue-dark transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
