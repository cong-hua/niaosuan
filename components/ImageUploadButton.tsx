'use client';

import { useState, useRef } from 'react';
import { MAX_UPLOAD_SIZE } from '@/lib/purine';

interface ImageUploadButtonProps {
  onImageSelected: (file: File) => void;
  onImageExtracted?: (data: { value: number; date: string; unit?: 'mmol/L' | 'mg/dL' | 'μmol/L'; confidence?: number }) => void;
  disabled?: boolean;
  className?: string;
  uploadType?: 'food' | 'medical';
}

interface ExtractedData {
  value: number;
  date: string;
  unit?: 'mmol/L' | 'mg/dL' | 'μmol/L';
  confidence?: number;
}

export default function ImageUploadButton({
  onImageSelected,
  onImageExtracted,
  disabled = false,
  className = '',
  uploadType = 'food'
}: ImageUploadButtonProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (file: File) => {
    // Validate file
    if (!file.type.startsWith('image/')) {
      setError('请选择图片文件');
      return;
    }

    if (file.size > MAX_UPLOAD_SIZE) {
      setError('图片过大，请选择 5MB 以内的文件');
      return;
    }

    setError(null);
    setIsUploading(true);
    setPreviewUrl(URL.createObjectURL(file));

    try {
      // Pass file to parent component
      onImageSelected(file);

      // Attempt OCR extraction if callback is provided
      if (onImageExtracted) {
        const extracted = await extractUricAcidData(file);
        if (extracted) {
          setExtractedData(extracted);
          onImageExtracted(extracted);
        }
      }
    } catch (err) {
      console.error('Image processing error:', err);
      setError(err instanceof Error ? err.message : '图片处理失败');
    } finally {
      setIsUploading(false);
    }
  };

  const extractUricAcidData = async (file: File): Promise<ExtractedData | null> => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/extract-uric-acid', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('OCR 提取失败');
      }

      const data = await response.json();
      return {
        value: data.value,
        date: data.date,
        confidence: data.confidence
      };
    } catch (err) {
      console.error('OCR extraction failed:', err);
      // Don't throw error - allow manual input as fallback
      return null;
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const clearImage = () => {
    setPreviewUrl(null);
    setExtractedData(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInputChange}
        className="hidden"
        disabled={disabled}
      />

      {/* Upload Area */}
      {!previewUrl ? (
        <div
          onClick={handleClick}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`
            border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
            ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          {isUploading ? (
            <div className="space-y-2">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-sm text-gray-600">正在处理图片...</p>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex justify-center">
                <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">
                  {uploadType === 'medical' ? '上传医疗检验报告' : '点击上传或拖拽图片到此处'}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {uploadType === 'medical'
                    ? '支持 JPG, PNG 格式的检验报告，确保尿酸值清晰可见，最大 5MB'
                    : '支持 JPG, PNG 格式，最大 5MB'
                  }
                </p>
                {uploadType === 'medical' && (
                  <p className="text-xs text-blue-600 mt-1">
                    💡 系统将自动识别报告中的尿酸值和检测日期
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {/* Image Preview */}
          <div className="relative">
            <img
              src={previewUrl}
              alt="预览"
              className="w-full max-h-64 object-cover rounded-lg"
            />
            <button
              onClick={clearImage}
              className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
              title="移除图片"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Extracted Data */}
          {extractedData && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm font-medium text-green-800">识别结果</span>
                {extractedData.confidence && (
                  <span className="text-xs text-green-600">
                    置信度: {Math.round(extractedData.confidence * 100)}%
                  </span>
                )}
              </div>
              <div className="text-sm text-green-700 space-y-1">
                <p>尿酸值: {extractedData.value} {extractedData.unit || 'mmol/L'}</p>
                <p>检测日期: {new Date(extractedData.date).toLocaleDateString('zh-CN')}</p>
                {uploadType === 'medical' && extractedData.unit && (
                  <p className="text-xs text-green-600">
                    💡 已自动识别单位: {extractedData.unit}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Upload New Image */}
          <button
            onClick={handleClick}
            disabled={disabled}
            className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200 transition-colors text-sm font-medium"
          >
            重新选择图片
          </button>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm font-medium text-red-800">错误</span>
          </div>
          <p className="text-sm text-red-700 mt-1">{error}</p>
        </div>
      )}
    </div>
  );
}