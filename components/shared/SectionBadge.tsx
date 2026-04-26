import { sectionLabels, type McatSection } from "@/lib/constants";
export function SectionBadge({ section }: { section: McatSection }) {
  return <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">{sectionLabels[section] ?? section}</span>;
}
