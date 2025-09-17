"use client";

import { useRef } from "react";

type UploadButtonProps = {
  onFileSelected: (file: File) => void;
  disabled?: boolean;
};

export function UploadButton({ onFileSelected, disabled }: UploadButtonProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleClick = () => {
    if (!disabled) {
      inputRef.current?.click();
    }
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onFileSelected(file);
    }
    event.target.value = "";
  };

  return (
    <div className="w-full max-w-md">
      <input
        type="file"
        accept="image/*"
        className="hidden"
        ref={inputRef}
        onChange={handleChange}
      />
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled}
        className="group relative flex h-32 w-full items-center justify-center gap-4 rounded-3xl bg-gradient-to-r from-green-400 to-blue-500 px-8 text-white shadow-lg transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-green-200 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white/15 text-white shadow-inner transition-transform duration-300 group-hover:scale-105">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            className="h-12 w-12"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 6.75h1.5a2.25 2.25 0 0 1 2.25 2.25v7.5a2.25 2.25 0 0 1-2.25 2.25h-9a2.25 2.25 0 0 1-2.25-2.25V9a2.25 2.25 0 0 1 2.25-2.25h1.379a2.25 2.25 0 0 0 1.59-.659l.83-.83a2.25 2.25 0 0 1 1.59-.659h1.5"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 15.375a2.625 2.625 0 1 0 0-5.25 2.625 2.625 0 0 0 0 5.25Z"
            />
          </svg>
        </span>
        <span className="text-2xl font-semibold tracking-tight">拍照 / 上传食物</span>
      </button>
    </div>
  );
}
