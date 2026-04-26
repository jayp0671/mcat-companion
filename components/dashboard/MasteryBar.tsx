type MasteryBarProps = {
  label: string;
  value: number;
  detail?: string;
};

export function MasteryBar({ label, value, detail }: MasteryBarProps) {
  const safeValue = Math.min(Math.max(Math.round(value), 0), 100);

  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-800">{label}</p>
          {detail ? <p className="text-xs text-slate-500">{detail}</p> : null}
        </div>
        <p className="text-sm font-semibold text-slate-950">{safeValue}</p>
      </div>
      <div className="h-2 rounded-full bg-slate-100">
        <div
          className="h-2 rounded-full bg-slate-900"
          style={{ width: `${safeValue}%` }}
        />
      </div>
    </div>
  );
}
