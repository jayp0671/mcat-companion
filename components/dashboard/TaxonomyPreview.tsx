import { Card, CardContent, CardTitle } from "@/components/ui/card";

type Node = {
  id: string;
  name: string;
  code: string | null;
  level: string;
};

type TaxonomyPreviewProps = {
  nodes: Node[];
};

export function TaxonomyPreview({ nodes }: TaxonomyPreviewProps) {
  const sections = nodes.filter((node) => node.level === "section");

  return (
    <Card>
      <CardTitle>Taxonomy loaded</CardTitle>
      <CardContent className="mt-4">
        <p className="text-sm text-slate-600">
          {nodes.length} taxonomy nodes are available for tagging future mistake logs.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {sections.map((section) => (
            <span key={section.id} className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
              {section.name}
            </span>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
