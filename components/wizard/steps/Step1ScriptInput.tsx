'use client';

import { useState, useRef } from 'react';
import TextInput from '@/components/forms/TextInput';

interface Step1ScriptInputProps {
  generationType: 'text-to-video' | 'image-to-video' | 'video-to-video';
  scriptText: string;
  captionText: string;
  uploadedFile: File | null;
  onChange: (updates: {
    scriptText?: string;
    captionText?: string;
    uploadedFile?: File | null;
  }) => void;
}

export default function Step1ScriptInput({
  generationType,
  scriptText,
  captionText,
  uploadedFile,
  onChange,
}: Step1ScriptInputProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  const needsFileUpload =
    generationType === 'image-to-video' || generationType === 'video-to-video';

  const getFileTypeLabel = () => {
    if (generationType === 'image-to-video') return 'Image';
    if (generationType === 'video-to-video') return 'Video';
    return '';
  };

  const getAcceptedFileTypes = () => {
    if (generationType === 'image-to-video') return 'image/*';
    if (generationType === 'video-to-video') return 'video/*';
    return '';
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onChange({ uploadedFile: e.dataTransfer.files[0] });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onChange({ uploadedFile: e.target.files[0] });
    }
  };

  const removeFile = () => {
    onChange({ uploadedFile: null });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      <div>
        {/* <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Let's Create Your Video
        </h2> */}
        {/* <p className="text-gray-600">
          {needsFileUpload
            ? `Upload your ${getFileTypeLabel().toLowerCase()} and add a script to enhance it`
            : 'Write a script that will be transformed into an engaging video'}
        </p> */}
      </div>

      {/* File Upload - Above Video Title */}
      {needsFileUpload && (
        <div>
          <label className="block text-sm font-semibold text-linkedin-gray-700 mb-2">
            Upload {getFileTypeLabel()} <span className="text-red-500">*</span>
          </label>

          {uploadedFile ? (
            <div className="border-2 border-[#0A66C2] rounded-lg overflow-hidden bg-blue-50">
              {generationType === 'image-to-video' && (
                <div className="w-full h-24 bg-gray-900 flex items-center justify-center">
                  <img
                    src={URL.createObjectURL(uploadedFile)}
                    alt="Preview"
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
              )}
              <div className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-[#0A66C2] rounded-lg flex items-center justify-center">
                      {generationType === 'image-to-video' ? (
                        <svg
                          className="w-5 h-5 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                      ) : (
                        <svg
                          className="w-5 h-5 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                          />
                        </svg>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {uploadedFile.name === 'imported-image.jpg'
                          ? 'Imported from post'
                          : uploadedFile.name}
                      </p>
                      {uploadedFile.name !== 'imported-image.jpg' && (
                        <p className="text-xs text-gray-500">
                          {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={removeFile}
                    className="p-1.5 hover:bg-red-100 rounded-lg transition-colors"
                  >
                    <svg
                      className="w-4 h-4 text-red-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`
                border-2 border-dashed rounded-lg p-5 text-center transition-colors cursor-pointer
                ${
                  dragActive
                    ? 'border-[#0A66C2] bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400'
                }
              `}
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    Drop your {getFileTypeLabel().toLowerCase()} here or click to browse
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {generationType === 'image-to-video'
                      ? 'PNG, JPG, GIF up to 10MB'
                      : 'MP4, MOV, AVI up to 100MB'}
                  </p>
                </div>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept={getAcceptedFileTypes()}
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          )}
        </div>
      )}

      {/* Video Title Input */}
      <div>
        <label className="block text-sm font-semibold text-linkedin-gray-700 mb-2">
          Video title
        </label>
        <input
          type="text"
          value={captionText}
          onChange={(e) => onChange({ captionText: e.target.value })}
          placeholder="Enter your video caption (e.g., video title)"
          className="w-full px-4 py-2.5 text-sm border border-linkedin-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-linkedin-blue/40 focus:border-linkedin-blue bg-white shadow-sm transition-all"
        />
      </div>

      {/* Use Original TextInput Component */}
      <TextInput
        value={scriptText}
        onChange={(value) => onChange({ scriptText: value })}
        placeholder="Describe what you want your video to convey... Your story, insight, or idea that connects with your professional audience"
        rows={12}
        label="Video Script"
      />
    </div>
  );
}
