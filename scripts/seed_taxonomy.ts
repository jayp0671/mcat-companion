import fs from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

type NodeSeed = {
  code: string;
  name: string;
  level: "section" | "foundation" | "category" | "topic" | "subtopic";
  section: string;
  parentCode?: string;
  sort_order: number;
};

function loadDotEnvLocal() {
  const envPath = path.join(process.cwd(), ".env.local");
  if (!fs.existsSync(envPath)) return;

  const contents = fs.readFileSync(envPath, "utf8");
  for (const line of contents.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const index = trimmed.indexOf("=");
    if (index === -1) continue;
    const key = trimmed.slice(0, index).trim();
    const value = trimmed.slice(index + 1).trim().replace(/^['"]|['"]$/g, "");
    process.env[key] ||= value;
  }
}

loadDotEnvLocal();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. Add them to .env.local first.");
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const nodes: NodeSeed[] = [
  { code: "chem_phys", name: "Chemical and Physical Foundations", level: "section", section: "chem_phys", sort_order: 10 },
  { code: "cars", name: "Critical Analysis and Reasoning Skills", level: "section", section: "cars", sort_order: 20 },
  { code: "bio_biochem", name: "Biological and Biochemical Foundations", level: "section", section: "bio_biochem", sort_order: 30 },
  { code: "psych_soc", name: "Psychological, Social, and Biological Foundations", level: "section", section: "psych_soc", sort_order: 40 },

  { code: "CP-F1", name: "Physical sciences and biological systems", level: "foundation", section: "chem_phys", parentCode: "chem_phys", sort_order: 101 },
  { code: "CP-ATOMS", name: "Atomic structure and periodic trends", level: "topic", section: "chem_phys", parentCode: "CP-F1", sort_order: 102 },
  { code: "CP-BONDING", name: "Bonding and intermolecular forces", level: "topic", section: "chem_phys", parentCode: "CP-F1", sort_order: 103 },
  { code: "CP-FLUIDS", name: "Fluids and circulation physics", level: "topic", section: "chem_phys", parentCode: "CP-F1", sort_order: 104 },
  { code: "CP-OPTICS", name: "Light, optics, and lenses", level: "topic", section: "chem_phys", parentCode: "CP-F1", sort_order: 105 },

  { code: "CARS-F1", name: "Foundations of comprehension and reasoning", level: "foundation", section: "cars", parentCode: "cars", sort_order: 201 },
  { code: "CARS-MAIN", name: "Main idea and passage structure", level: "topic", section: "cars", parentCode: "CARS-F1", sort_order: 202 },
  { code: "CARS-INFER", name: "Inference and implication", level: "topic", section: "cars", parentCode: "CARS-F1", sort_order: 203 },
  { code: "CARS-TONE", name: "Tone, attitude, and author perspective", level: "topic", section: "cars", parentCode: "CARS-F1", sort_order: 204 },

  { code: "BB-F1", name: "Biomolecules: structure, function, regulation", level: "foundation", section: "bio_biochem", parentCode: "bio_biochem", sort_order: 301 },
  { code: "BB-AMINO", name: "Amino acids", level: "topic", section: "bio_biochem", parentCode: "BB-F1", sort_order: 302 },
  { code: "BB-PROTEIN", name: "Protein structure and function", level: "topic", section: "bio_biochem", parentCode: "BB-F1", sort_order: 303 },
  { code: "BB-ENZYMES", name: "Enzyme kinetics and inhibition", level: "topic", section: "bio_biochem", parentCode: "BB-F1", sort_order: 304 },
  { code: "BB-METABOLISM", name: "Metabolism and bioenergetics", level: "topic", section: "bio_biochem", parentCode: "BB-F1", sort_order: 305 },

  { code: "PS-F1", name: "Behavior and mental processes", level: "foundation", section: "psych_soc", parentCode: "psych_soc", sort_order: 401 },
  { code: "PS-LEARNING", name: "Learning and memory", level: "topic", section: "psych_soc", parentCode: "PS-F1", sort_order: 402 },
  { code: "PS-SOCIAL", name: "Social processes and behavior", level: "topic", section: "psych_soc", parentCode: "PS-F1", sort_order: 403 },
  { code: "PS-DEMOGRAPHICS", name: "Demographics and social stratification", level: "topic", section: "psych_soc", parentCode: "PS-F1", sort_order: 404 },
];

const reasoningSkills = [
  { code: "SIRS1", name: "Knowledge of scientific concepts and principles", description: "Recognize, recall, and apply core concepts." },
  { code: "SIRS2", name: "Scientific reasoning and problem solving", description: "Use scientific principles to solve new problems." },
  { code: "SIRS3", name: "Reasoning about research design and execution", description: "Interpret variables, controls, study design, and experimental setup." },
  { code: "SIRS4", name: "Data-based and statistical reasoning", description: "Interpret graphs, tables, statistics, and evidence." },
];

async function main() {
  const idByCode = new Map<string, string>();

  for (const node of nodes) {
    const parent_id = node.parentCode ? idByCode.get(node.parentCode) ?? null : null;
    const { data, error } = await supabase
      .from("taxonomy_nodes")
      .upsert(
        {
          code: node.code,
          name: node.name,
          level: node.level,
          section: node.section,
          parent_id,
          sort_order: node.sort_order,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "code" },
      )
      .select("id,code")
      .single();

    if (error) throw error;
    idByCode.set(data.code, data.id);
  }

  for (const skill of reasoningSkills) {
    const { error } = await supabase
      .from("reasoning_skills")
      .upsert({ ...skill, updated_at: new Date().toISOString() }, { onConflict: "code" });

    if (error) throw error;
  }

  console.log(`Seeded ${nodes.length} taxonomy nodes and ${reasoningSkills.length} reasoning skills.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
