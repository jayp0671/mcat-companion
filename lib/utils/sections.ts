export const SECTION_LABELS: Record<string, string> = {
  chem_phys: "Chem/Phys",
  cars: "CARS",
  bio_biochem: "Bio/Biochem",
  psych_soc: "Psych/Soc",
};

export function formatSection(section: string | null | undefined) {
  if (!section) return "Unknown section";
  return SECTION_LABELS[section] ?? section;
}

export function formatDifficulty(difficulty: number | null | undefined) {
  if (!difficulty) return "Unrated";
  return `${difficulty}/5`;
}
