'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';

interface Step2HashtagsProps {
  hashtags: string;
  onChange: (hashtags: string) => void;
}

export default function Step2Hashtags({ hashtags, onChange }: Step2HashtagsProps) {
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    console.log('Step2Hashtags: Received hashtags prop:', hashtags);
  }, [hashtags]);

  const hashtagArray = hashtags
    .split(' ')
    .filter((tag) => tag.startsWith('#') && tag.length > 1);

  const hasGeneratedHashtags = hashtagArray.length > 0;

  const removeHashtag = (tagToRemove: string) => {
    const updatedHashtags = hashtagArray
      .filter((tag) => tag !== tagToRemove)
      .join(' ');
    onChange(updatedHashtags);
  };

  const addHashtag = () => {
    const trimmed = inputValue.trim();
    if (!trimmed) return;

    // Add # if not present
    const newTag = trimmed.startsWith('#') ? trimmed : `#${trimmed}`;

    // Check if already exists
    if (hashtagArray.includes(newTag)) {
      setInputValue('');
      return;
    }

    const updatedHashtags = [...hashtagArray, newTag].join(' ');
    onChange(updatedHashtags);
    setInputValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addHashtag();
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Add Hashtags</h2>
        <p className="text-gray-600">
          {hasGeneratedHashtags
            ? 'AI-generated hashtags from your script. Edit or add more as needed.'
            : 'Help your video reach the right audience with relevant hashtags (optional)'}
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Hashtags
          {hasGeneratedHashtags && (
            <span className="ml-2 text-xs font-normal text-[#0A66C2]">
              (Auto-generated from script)
            </span>
          )}
        </label>

        {/* Hashtag Pills */}
        {hashtagArray.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            {hashtagArray.map((tag, index) => (
              <div
                key={index}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#0A66C2] text-[#0A66C2] rounded-full text-sm font-medium shadow-sm"
              >
                <span>{tag}</span>
                <button
                  onClick={() => removeHashtag(tag)}
                  className="hover:bg-[#0A66C2] hover:text-white rounded-full p-0.5 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Add Hashtag Input */}
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Add hashtag (e.g., marketing or #marketing)"
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A66C2] focus:border-transparent"
          />
          <button
            onClick={addHashtag}
            className="px-6 py-3 bg-[#0A66C2] text-white rounded-lg hover:bg-[#004182] transition-colors font-medium"
          >
            Add
          </button>
        </div>

        <div className="flex items-center justify-between mt-2">
          <p className="text-sm text-gray-500">
            Press Enter or click Add to include a hashtag
          </p>
          {hashtagArray.length > 0 && (
            <p className="text-sm font-medium text-[#0A66C2]">
              {hashtagArray.length} hashtag{hashtagArray.length !== 1 ? 's' : ''}
            </p>
          )}
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex gap-3">
          <svg
            className="w-5 h-5 text-[#0A66C2] flex-shrink-0 mt-0.5"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
          <div>
            <h3 className="font-medium text-gray-900 mb-1">Hashtag Tips</h3>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Use 3-5 relevant hashtags for best engagement</li>
              <li>• Mix popular and niche hashtags</li>
              <li>• Research trending hashtags in your industry</li>
            </ul>
          </div>
        </div>
      </div>

      {hashtagArray.length === 0 && (
        <div className="text-center py-8">
          <svg
            className="w-16 h-16 mx-auto text-gray-300 mb-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"
            />
          </svg>
          <p className="text-gray-500">
            No hashtags yet. Add some to boost your video's reach!
          </p>
        </div>
      )}
    </div>
  );
}
