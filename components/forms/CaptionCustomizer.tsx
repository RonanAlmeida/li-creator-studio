'use client';

import { useState } from 'react';
import { CaptionOptions } from '@/types';
import { Type, ChevronDown, ChevronUp, Palette, ChevronDown as ChevronDownIcon } from 'lucide-react';

interface CaptionCustomizerProps {
  options: CaptionOptions;
  onChange: (options: CaptionOptions) => void;
}

const PRESET_COLORS = [
  { name: 'White', value: '#FFFFFF', bg: 'bg-white' },
  { name: 'Yellow', value: '#FFD700', bg: 'bg-yellow-400' },
  { name: 'Orange', value: '#FF6B35', bg: 'bg-orange-500' },
  { name: 'Red', value: '#FF3B30', bg: 'bg-red-500' },
  { name: 'Pink', value: '#FF2D55', bg: 'bg-pink-500' },
  { name: 'Purple', value: '#AF52DE', bg: 'bg-purple-500' },
  { name: 'Blue', value: '#0A84FF', bg: 'bg-blue-500' },
  { name: 'Cyan', value: '#5AC8FA', bg: 'bg-cyan-400' },
  { name: 'Green', value: '#34C759', bg: 'bg-green-500' },
  { name: 'Black', value: '#000000', bg: 'bg-black' },
];

const FONTS = [
  { name: 'Inter', value: 'Inter, system-ui, sans-serif' },
  { name: 'Roboto', value: 'Roboto, sans-serif' },
  { name: 'Poppins', value: 'Poppins, sans-serif' },
  { name: 'Montserrat', value: 'Montserrat, sans-serif' },
  { name: 'Oswald', value: 'Oswald, sans-serif' },
  { name: 'Bebas Neue', value: 'Bebas Neue, sans-serif' },
  { name: 'Playfair', value: 'Playfair Display, serif' },
  { name: 'Space Grotesk', value: 'Space Grotesk, sans-serif' },
];

// Short sample caption for compact preview
const SAMPLE_CAPTION = "Caption text";

export default function CaptionCustomizer({ options, onChange }: CaptionCustomizerProps) {
  const [isExpanded, setIsExpanded] = useState(options.enabled);
  const [showFontDropdown, setShowFontDropdown] = useState(false);

  const updateOption = (key: keyof CaptionOptions, value: any) => {
    onChange({ ...options, [key]: value });
  };

  const getStyleClasses = () => {
    switch (options.style) {
      case 'bold':
        return 'font-bold text-sm tracking-wide';
      case 'minimal':
        return 'font-light text-xs tracking-normal';
      default:
        return 'font-semibold text-sm tracking-wide';
    }
  };

  const selectedFont = FONTS.find(f => f.value === options.style) || FONTS[0];

  return (
    <div className="border border-linkedin-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
      {/* Header with Toggle */}
      <button
        onClick={() => {
          updateOption('enabled', !options.enabled);
          if (!options.enabled) {
            setIsExpanded(true);
          }
        }}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-linkedin-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg transition-all duration-200 ${
            options.enabled ? 'bg-linkedin-blue shadow-sm' : 'bg-linkedin-gray-100'
          }`}>
            <Type className={`w-4 h-4 transition-colors ${options.enabled ? 'text-white' : 'text-linkedin-gray-600'}`} />
          </div>
          <div className="text-left">
            <span className="text-sm font-semibold text-linkedin-gray-900 block">Captions</span>
            <span className="text-xs text-linkedin-gray-600">
              {options.enabled ? `${options.style} • ${selectedFont.name}` : 'Add subtitles'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-300 ${
            options.enabled ? 'bg-linkedin-blue' : 'bg-linkedin-gray-300'
          }`}>
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 shadow-sm ${
              options.enabled ? 'translate-x-6' : 'translate-x-1'
            }`} />
          </div>
          {options.enabled && (
            <div className="text-linkedin-gray-500">
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </div>
          )}
        </div>
      </button>

      {/* Collapsible Content */}
      <div className={`transition-all duration-300 ease-in-out ${
        options.enabled && isExpanded ? 'max-h-80 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
      }`}>
        <div className="px-4 pb-3 pt-1 space-y-3 border-t border-linkedin-gray-100">
          
          {/* Compact Caption Preview */}
          <div>
            <label className="block text-[10px] font-semibold text-linkedin-gray-500 mb-1.5 tracking-wide uppercase">
              Preview
            </label>
            <div className="relative bg-slate-900 rounded-lg overflow-hidden h-16 flex items-center justify-center px-4">
              <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900" />
              <div className="relative z-10">
                <div 
                  className={`text-center ${getStyleClasses()}`}
                  style={{ 
                    color: options.color,
                    fontFamily: selectedFont.value,
                    textShadow: options.color === '#FFFFFF' ? '0 1px 3px rgba(0,0,0,0.9)' : '0 1px 2px rgba(0,0,0,0.6)'
                  }}
                >
                  {SAMPLE_CAPTION}
                </div>
              </div>
            </div>
          </div>

          {/* Font Dropdown */}
          <div className="relative">
            <label className="block text-[10px] font-semibold text-linkedin-gray-500 mb-1.5 tracking-wide uppercase">
              Font Family
            </label>
            <button
              onClick={() => setShowFontDropdown(!showFontDropdown)}
              className="w-full flex items-center justify-between px-3 py-2 bg-white border border-linkedin-gray-200 rounded-lg text-xs text-linkedin-gray-700 hover:border-linkedin-gray-300 transition-colors"
            >
              <span style={{ fontFamily: selectedFont.value }}>{selectedFont.name}</span>
              <ChevronDownIcon className={`w-3.5 h-3.5 text-linkedin-gray-400 transition-transform ${showFontDropdown ? 'rotate-180' : ''}`} />
            </button>
            {showFontDropdown && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-linkedin-gray-200 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                {FONTS.map((font) => (
                  <button
                    key={font.value}
                    onClick={() => {
                      updateOption('style', font.value);
                      setShowFontDropdown(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs hover:bg-linkedin-gray-50 transition-colors ${
                      selectedFont.value === font.value ? 'bg-linkedin-blue/5 text-linkedin-blue font-medium' : 'text-linkedin-gray-700'
                    }`}
                    style={{ fontFamily: font.value }}
                  >
                    {font.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Style Selection */}
          <div>
            <label className="block text-[10px] font-semibold text-linkedin-gray-500 mb-1.5 tracking-wide uppercase">
              Style
            </label>
            <div className="grid grid-cols-3 gap-2">
              {['default', 'bold', 'minimal'].map((style) => (
                <button
                  key={style}
                  onClick={() => updateOption('style', style)}
                  className={`py-1.5 px-2 rounded-lg text-xs font-medium transition-all border capitalize ${
                    options.style === style
                      ? 'bg-linkedin-blue text-white border-linkedin-blue'
                      : 'bg-white border-linkedin-gray-200 text-linkedin-gray-700 hover:border-linkedin-gray-300'
                  }`}
                >
                  {style}
                </button>
              ))}
            </div>
          </div>

          {/* Color Selection */}
          <div>
            <label className="block text-[10px] font-semibold text-linkedin-gray-500 mb-1.5 tracking-wide uppercase flex items-center gap-1">
              <Palette className="w-3 h-3" />
              Color
            </label>
            <div className="flex gap-1.5 flex-wrap">
              {PRESET_COLORS.map((color) => (
                <button
                  key={color.value}
                  onClick={() => updateOption('color', color.value)}
                  className={`w-7 h-7 rounded-md border-2 transition-all hover:scale-110 relative ${
                    options.color === color.value
                      ? 'border-linkedin-gray-900 ring-1 ring-linkedin-gray-400 scale-105'
                      : 'border-transparent hover:border-linkedin-gray-300'
                  }`}
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                >
                  {options.color === color.value && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <svg className={`w-3.5 h-3.5 ${color.value === '#FFFFFF' ? 'text-linkedin-gray-800' : 'text-white'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
