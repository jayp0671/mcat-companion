export const mcatSections = [
  { value: "chem_phys", label: "Chem/Phys" },
  { value: "cars", label: "CARS" },
  { value: "bio_biochem", label: "Bio/Biochem" },
  { value: "psych_soc", label: "Psych/Soc" }
] as const;
export type McatSection = (typeof mcatSections)[number]["value"];
export const sectionLabels: Record<McatSection, string> = {
  chem_phys: "Chem/Phys",
  cars: "CARS",
  bio_biochem: "Bio/Biochem",
  psych_soc: "Psych/Soc"
};
