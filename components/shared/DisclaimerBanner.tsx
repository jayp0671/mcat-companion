export function DisclaimerBanner({ children = "AI-generated content may contain errors. Cross-check with official explanations when available." }: { children?: React.ReactNode }) {
  return <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">{children}</div>;
}
