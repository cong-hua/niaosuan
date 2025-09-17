"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { UploadButton } from "@/components/upload-button";
import { ResultCard } from "@/components/result-card";
import { LoadingOverlay } from "@/components/loading-overlay";
import { MAX_UPLOAD_SIZE, type PurineStatus } from "@/lib/purine";

type IdentifyResponse = {
  foodName: string;
  label?: string;
};

type PurineResponse = {
  name: string;
  display_name?: string;
  purine_level: PurineStatus;
  purine_mg?: number | null;
  summary: string;
  diet_advice: string;
  suitability: string;
  badge_label?: string;
  category?: string | null;
};

export default function HomePage() {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [result, setResult] = useState<PurineResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [retryFile, setRetryFile] = useState<File | null>(null);

  const handleFileSelected = async (file: File) => {
    if (file.size > MAX_UPLOAD_SIZE) {
      setError("图片过大，请选择 5MB 以内的文件。");
      return;
    }

    setError(null);
    setResult(null);
    setRetryFile(file);
    setIsLoading(true);

    const readerUrl = URL.createObjectURL(file);
    setPreviewUrl(readerUrl);

    try {
      const identifyData = await callIdentify(file);
      const purineData = await callPurine(identifyData.foodName, identifyData.label);
      setResult(purineData);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "识别失败，请稍后再试。");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = async () => {
    if (!retryFile) return;

    setError(null);
    setResult(null);
    setIsLoading(true);

    try {
      const identifyData = await callIdentify(retryFile);
      const purineData = await callPurine(identifyData.foodName, identifyData.label);
      setResult(purineData);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "识别失败，请稍后再试。");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  return (
    <div className="relative flex min-h-screen flex-col bg-gradient-to-br from-[#f0fff4] to-[#e6f7ff]">
      <DesktopHeader />
      <main className="flex flex-1 flex-col items-center justify-center px-4 pb-24 pt-12">
        <div className="flex w-full max-w-2xl flex-col items-center gap-8 text-center">
          <div className="relative w-full max-w-md">
            <UploadButton onFileSelected={handleFileSelected} disabled={isLoading} />
            {isLoading && <LoadingOverlay />}
          </div>
          <p className="text-gray-600">一键识别，检测嘌呤风险</p>

          {previewUrl && (
            <div className="w-full max-w-lg overflow-hidden rounded-3xl bg-white/60 shadow">
              <div className="relative h-64 w-full">
                <Image
                  src={previewUrl}
                  alt="上传图片预览"
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
            </div>
          )}

          {error && (
            <div className="w-full max-w-lg rounded-3xl border border-red-200 bg-red-50 p-6 text-red-700">
              <div className="flex items-start gap-3">
                <div className="mt-0.5">
                  <svg className="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="font-medium">识别失败</p>
                  <p className="mt-1 text-sm">{error}</p>
                  {retryFile && (
                    <button
                      onClick={handleRetry}
                      disabled={isLoading}
                      className="mt-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? '重试中...' : '重新识别'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {result && (
            <ResultCard
              foodName={result.display_name ?? result.name}
              status={result.purine_level}
              purineMg={result.purine_mg}
              summary={result.summary}
              dietAdvice={result.diet_advice}
              suitability={result.suitability}
              badgeLabel={result.badge_label}
            />
          )}
        </div>
      </main>
      <MobileNav />
    </div>
  );
}

function DesktopHeader() {
  return (
    <header className="sticky top-0 z-10 hidden w-full items-center justify-between border-b border-white/30 bg-white/40 px-12 py-4 backdrop-blur md:flex">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-green-400 to-blue-500 text-white shadow">
          <span className="text-lg font-bold">UA</span>
        </div>
        <div>
          <h1 className="text-xl font-semibold tracking-tight">AI 痛风饮食助手</h1>
          <p className="text-xs text-gray-500">即刻识别，掌握嘌呤风险</p>
        </div>
      </div>
      <nav className="flex items-center gap-8 text-sm font-medium">
        <a className="text-[#0e1b14] transition-colors hover:text-green-500" href="#">尿酸记录</a>
        <a className="text-[#0e1b14] transition-colors hover:text-green-500" href="#">我的</a>
      </nav>
    </header>
  );
}

function MobileNav() {
  return (
    <nav className="fixed bottom-0 left-0 z-10 w-full border-t border-gray-200 bg-white/90 backdrop-blur md:hidden">
      <div className="mx-auto flex h-16 max-w-md items-center justify-around px-4 text-sm">
        <button className="flex flex-col items-center gap-1 text-green-500">
          <CameraIcon className="h-6 w-6" />
          首页
        </button>
        <button className="flex flex-col items-center gap-1 text-gray-500">
          <NoteIcon className="h-6 w-6" />
          记录
        </button>
        <button className="flex flex-col items-center gap-1 text-gray-500">
          <TrendIcon className="h-6 w-6" />
          趋势
        </button>
        <button className="flex flex-col items-center gap-1 text-gray-500">
          <UserIcon className="h-6 w-6" />
          我的
        </button>
      </div>
    </nav>
  );
}

async function callIdentify(file: File): Promise<IdentifyResponse> {
  const formData = new FormData();
  formData.append("file", file);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 60000); // 60秒超时

  try {
    const response = await fetch("/api/identify", {
      method: "POST",
      body: formData,
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await parseError(response, "识别失败");
      let errorMessage = errorData;

      // 根据状态码提供更友好的错误信息
      switch (response.status) {
        case 422:
          errorMessage = "图片识别失败，请尝试更换更清晰的食物图片";
          break;
        case 413:
          errorMessage = "图片过大，请选择 5MB 以内的文件";
          break;
        case 502:
          errorMessage = "网络连接异常，请检查网络后重试";
          break;
        case 503:
          errorMessage = "识别服务暂时不可用，请稍后再试";
          break;
        default:
          errorMessage = errorData;
      }

      throw new Error(errorMessage);
    }

    return response.json();
  } catch (error) {
    clearTimeout(timeoutId);

    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error("识别超时，请重试或更换图片");
    }

    throw error;
  }
}

async function callPurine(foodName: string, label?: string): Promise<PurineResponse> {
  const params = new URLSearchParams({ name: foodName });
  if (label && label !== foodName) {
    params.append("label", label);
  }
  const response = await fetch(`/api/purine?${params.toString()}`);
  if (!response.ok) {
    throw new Error(await parseError(response, "查询失败"));
  }
  return response.json();
}

async function parseError(response: Response, fallback: string) {
  try {
    const data = await response.json();
    return typeof data?.message === "string" ? data.message : fallback;
  } catch (error) {
    console.error("Failed to parse error body", error);
    return fallback;
  }
}

function CameraIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 7.5h-.75A2.25 2.25 0 0 0 3 9.75v7.5A2.25 2.25 0 0 0 5.25 19.5h13.5A2.25 2.25 0 0 0 21 17.25v-7.5a2.25 2.25 0 0 0-2.25-2.25H18" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15.75a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 7.5 10.057 5.37A2.25 2.25 0 0 1 12.082 4.125h1.836A2.25 2.25 0 0 1 15.944 5.37L17 7.5" />
    </svg>
  );
}

function NoteIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m-9 4.5h9.75A2.25 2.25 0 0 0 18 18.75V4.5A2.25 2.25 0 0 0 15.75 2.25H8.25A2.25 2.25 0 0 0 6 4.5v16.5Z" />
    </svg>
  );
}

function TrendIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m3 17 6-6 4 4 8-8" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 15V9h-6" />
    </svg>
  );
}

function UserIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 7.5a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.5 20.25a7.5 7.5 0 0 1 15 0" />
    </svg>
  );
}
