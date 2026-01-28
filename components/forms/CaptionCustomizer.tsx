'use client';

import { useState } from 'react';
import { CaptionOptions } from '@/types';
import { Type, ChevronDown } from 'lucide-react';

interface CaptionCustomizerProps {
  options: CaptionOptions;
  onChange: (options: CaptionOptions) => void;
}

const PRESET_COLORS = [
  { name: 'White', value: '#FFFFFF' },
  { name: 'Yellow', value: '#FFD700' },
  { name: 'Orange', value: '#FF6B35' },
  { name: 'Red', value: '#FF3B30' },
  { name: 'Pink', value: '#FF2D55' },
  { name: 'Purple', value: '#AF52DE' },
  { name: 'Blue', value: '#0A84FF' },
  { name: 'Cyan', value: '#5AC8FA' },
  { name: 'Green', value: '#34C759' },
  { name: 'Black', value: '#000000' },
];

const FONTS = [
  { name: 'Sequel', value: 'Sequel Sans, sans-serif' },
  { name: 'Cabinet', value: 'Cabinet Grotesk, sans-serif' },
  { name: 'Satoshi', value: 'Satoshi, sans-serif' },
  { name: 'Bebas', value: 'Bebas Neue, sans-serif' },
  { name: 'Druk', value: 'Druk Wide, sans-serif' },
  { name: 'Impact', value: 'Impact, sans-serif' },
];

export default function CaptionCustomizer({ options, onChange }: CaptionCustomizerProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const updateOption = (key: keyof CaptionOptions, value: any) => {
    onChange({ ...options, [key]: value });
  };

  return (
    <div className="border border-slate-200/60 rounded-2xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-all duration-200">
      {/* Header with Toggle */}
      <div className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-slate-50 transition-colors group">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg transition-all duration-200 ${
            options.enabled
              ? 'bg-linkedin-blue shadow-sm'
              : 'bg-slate-100 group-hover:bg-slate-200'
          }`}>
            <Type className={`w-4 h-4 transition-colors ${options.enabled ? 'text-white' : 'text-slate-500'}`} />
          </div>
          <div className="text-left">
            <span className="text-sm font-semibold text-slate-800 block">Captions</span>
            <span className="text-xs text-slate-500">
              {options.enabled ? 'Customize appearance' : 'Add captions to video'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Toggle Switch */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              updateOption('enabled', !options.enabled);
              if (!options.enabled) {
                setIsExpanded(true);
              }
            }}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-300 ${
              options.enabled
                ? 'bg-linkedin-blue'
                : 'bg-slate-300'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 shadow-sm ${
                options.enabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>

          {/* Expand Arrow */}
          {options.enabled && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 hover:bg-slate-100 rounded transition-colors"
            >
              <ChevronDown
                className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${
                  isExpanded ? 'rotate-180' : ''
                }`}
              />
            </button>
          )}
        </div>
      </div>

      {/* Collapsible Content */}
      <div
        className={`transition-all duration-300 ease-in-out ${
          options.enabled && isExpanded
            ? 'max-h-96 opacity-100'
            : 'max-h-0 opacity-0 overflow-hidden'
        }`}
      >
        <div className="px-4 pb-4 pt-1 space-y-4 border-t border-slate-100">
          {/* Font Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-2.5 tracking-wide uppercase">
              Font
            </label>
            <div className="grid grid-cols-3 gap-2">
              {FONTS.map((font) => (
                <button
                  key={font.value}
                  onClick={() => updateOption('style', font.value)}
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all border-2 ${
                    options.style === font.value
                      ? 'bg-linkedin-blue border-linkedin-blue text-white shadow-sm'
                      : 'bg-white border-slate-200 text-slate-700 hover:border-linkedin-blue hover:bg-linkedin-blue/5'
                  }`}
                  style={{ fontFamily: font.value }}
                >
                  {font.name}
                </button>
              ))}
            </div>
          </div>

          {/* Position Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-2.5 tracking-wide uppercase">
              Position
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: 'top', label: 'Top', icon: '↑' },
                { value: 'center', label: 'Center', icon: '·' },
                { value: 'bottom', label: 'Bottom', icon: '↓' },
              ].map((pos) => (
                <button
                  key={pos.value}
                  onClick={() => updateOption('position', pos.value)}
                  className={`py-2.5 px-3 rounded-xl text-xs font-semibold transition-all border-2 flex items-center justify-center gap-1.5 ${
                    options.position === pos.value
                      ? 'bg-linkedin-blue border-linkedin-blue text-white shadow-sm'
                      : 'bg-white border-slate-200 text-slate-700 hover:border-linkedin-blue hover:bg-linkedin-blue/5'
                  }`}
                >
                  <span className="text-base">{pos.icon}</span>
                  {pos.label}
                </button>
              ))}
            </div>
          </div>

          {/* Color Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-2.5 tracking-wide uppercase">
              Color
            </label>
            <div className="grid grid-cols-5 gap-2.5">
              {PRESET_COLORS.map((color) => (
                <button
                  key={color.value}
                  onClick={() => updateOption('color', color.value)}
                  className={`h-11 rounded-xl border-2 transition-all hover:scale-110 ${
                    options.color === color.value
                      ? 'border-slate-800 ring-2 ring-slate-800 ring-offset-2 scale-105 shadow-lg'
                      : 'border-slate-200 hover:border-slate-400 shadow-sm'
                  }`}
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                >
                  {options.color === color.value && (
                    <div className="flex items-center justify-center">
                      <svg className={`w-5 h-5 ${color.value === '#FFFFFF' ? 'text-slate-800' : 'text-white'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
