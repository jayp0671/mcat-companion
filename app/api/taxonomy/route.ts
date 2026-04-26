import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type TaxonomyNode = {
  id: string;
  parent_id: string | null;
  level: string;
  code: string | null;
  name: string;
  description: string | null;
  section: string | null;
  sort_order: number | null;
  children?: TaxonomyNode[];
};

function buildTree(nodes: TaxonomyNode[]) {
  const byId = new Map(nodes.map((node) => [node.id, { ...node, children: [] as TaxonomyNode[] }]));
  const roots: TaxonomyNode[] = [];

  for (const node of byId.values()) {
    if (node.parent_id && byId.has(node.parent_id)) {
      byId.get(node.parent_id)?.children?.push(node);
    } else {
      roots.push(node);
    }
  }

  const sortNodes = (items: TaxonomyNode[]) => {
    items.sort((a, b) => (a.sort_order ?? 9999) - (b.sort_order ?? 9999) || a.name.localeCompare(b.name));
    for (const item of items) sortNodes(item.children ?? []);
  };

  sortNodes(roots);
  return roots;
}

export async function GET() {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("taxonomy_nodes")
    .select("id,parent_id,level,code,name,description,section,sort_order")
    .order("sort_order", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ nodes: data ?? [], tree: buildTree((data ?? []) as TaxonomyNode[]) });
}
