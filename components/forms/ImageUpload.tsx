'use client';

import { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { FILE_LIMITS } from '@/lib/constants';
import { validateFileType, validateFileSize, formatFileSize } from '@/lib/utils';
import Button from './Button';

interface ImageUploadProps {
  onImageSelect: (file: File) => void;
  onImageRemove: () => void;
  selectedImage: File | null;
  error?: string;
}

export default function ImageUpload({
  onImageSelect,
  onImageRemove,
  selectedImage,
  error,
}: ImageUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    const typeValidation = validateFileType(file, FILE_LIMITS.image.allowedTypes);
    if (!typeValidation.valid) {
      alert(typeValidation.error);
      return;
    }

    const sizeValidation = validateFileSize(file, FILE_LIMITS.image.maxSize);
    if (!sizeValidation.valid) {
      alert(sizeValidation.error);
      return;
    }

    onImageSelect(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
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
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleRemove = () => {
    onImageRemove();
    setPreview(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  if (selectedImage && preview) {
    return (
      <div className="relative border-2 border-linkedin-gray-300 rounded-lg p-4">
        <img
          src={preview}
          alt="Preview"
          className="w-full h-48 object-contain rounded"
        />
        <div className="mt-3 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-linkedin-gray-900">
              {selectedImage.name}
            </p>
            <p className="text-xs text-linkedin-gray-600">
              {formatFileSize(selectedImage.size)}
            </p>
          </div>
          <Button variant="ghost" onClick={handleRemove}>
            <X className="w-4 h-4" />
            Remove
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive
            ? 'border-linkedin-blue bg-blue-50'
            : error
            ? 'border-linkedin-error'
            : 'border-linkedin-gray-300 hover:border-linkedin-blue'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept={FILE_LIMITS.image.allowedTypes.map(t => `.${t}`).join(',')}
          onChange={handleChange}
          className="hidden"
        />
        <ImageIcon className="w-12 h-12 mx-auto mb-4 text-linkedin-gray-600" />
        <p className="text-sm font-medium text-linkedin-gray-900 mb-2">
          Drag and drop your image here
        </p>
        <p className="text-xs text-linkedin-gray-600 mb-4">
          or click to browse (JPG, PNG, GIF • Max {FILE_LIMITS.image.maxSize}MB)
        </p>
        <Button
          variant="secondary"
          onClick={() => inputRef.current?.click()}
        >
          <Upload className="w-4 h-4" />
          Choose Image
        </Button>
      </div>
      {error && (
        <p className="text-sm text-linkedin-error mt-2">{error}</p>
      )}
    </div>
  );
}
