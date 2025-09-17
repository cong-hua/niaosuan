export function LoadingOverlay() {
  return (
    <div className="absolute inset-0 flex items-center justify-center rounded-3xl bg-white/60 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-2 text-green-600">
        <span className="h-8 w-8 animate-spin rounded-full border-2 border-current border-t-transparent" />
        <p className="text-sm font-medium">识别中，请稍候…</p>
      </div>
    </div>
  );
}
