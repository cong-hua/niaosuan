import { PURINE_GUIDE, type PurineStatus } from "@/lib/purine";

type ResultCardProps = {
  foodName: string;
  status: PurineStatus;
  purineMg?: number | null;
  summary: string;
  dietAdvice: string;
  suitability: string;
  badgeLabel?: string;
};

const STATUS_STYLES: Record<PurineStatus, string> = {
  low: "bg-green-50 border-green-200 text-green-900",
  mid: "bg-yellow-50 border-yellow-200 text-yellow-900",
  high: "bg-red-50 border-red-200 text-red-900",
  unknown: "bg-gray-50 border-gray-200 text-gray-700"
};

export function ResultCard({
  foodName,
  status,
  purineMg,
  summary,
  dietAdvice,
  suitability,
  badgeLabel
}: ResultCardProps) {
  const label = badgeLabel ?? PURINE_GUIDE[status]?.label ?? "";
  const purineText = typeof purineMg === "number" ? `${Math.round(purineMg)} mg/100g` : "待补充";

  return (
    <div className={`w-full max-w-xl rounded-3xl border p-6 text-left shadow-md transition-all duration-300 ${STATUS_STYLES[status]}`}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-wide text-gray-500">识别食物</p>
          <h3 className="mt-1 text-2xl font-bold">{foodName}</h3>
        </div>
        <span className="rounded-full bg-white/80 px-4 py-1 text-sm font-semibold shadow">{label}</span>
      </div>

      <div className="mt-4 space-y-3 text-base leading-relaxed">
        <p>{summary}</p>
        <div className="flex flex-col gap-2 rounded-2xl bg-white/70 p-4 text-sm text-gray-700">
          <div className="flex items-center justify-between">
            <span className="font-medium text-gray-600">嘌呤含量</span>
            <span className="font-semibold text-gray-800">{purineText}</span>
          </div>
          <div>
            <p className="font-medium text-gray-600">饮食建议</p>
            <p className="mt-1 text-gray-700">{dietAdvice}</p>
          </div>
          <div>
            <p className="font-medium text-gray-600">高尿酸患者</p>
            <p className="mt-1 text-gray-700">{suitability}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
