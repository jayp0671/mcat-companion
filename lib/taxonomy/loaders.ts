import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { ReasoningSkill, TaxonomyNode } from "@/lib/mistakes/types";

export async function loadTaxonomyForUser() {
  const supabase = createSupabaseServerClient();

  const [{ data: nodes, error: nodesError }, { data: skills, error: skillsError }] =
    await Promise.all([
      supabase
        .from("taxonomy_nodes")
        .select("id,parent_id,level,code,name,description,section,sort_order")
        .order("sort_order", { ascending: true }),
      supabase
        .from("reasoning_skills")
        .select("id,code,name,description")
        .order("code", { ascending: true }),
    ]);

  if (nodesError) throw new Error(nodesError.message);
  if (skillsError) throw new Error(skillsError.message);

  return {
    nodes: (nodes ?? []) as TaxonomyNode[],
    skills: (skills ?? []) as ReasoningSkill[],
  };
}
