import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

describe("taxonomy seed files", () => {
  it("keeps phase 2 taxonomy files in place", () => {
    const taxonomyDir = path.join(process.cwd(), "packages", "taxonomy");
    const files = ["chem_phys.yaml", "cars.yaml", "bio_biochem.yaml", "psych_soc.yaml", "reasoning_skills.yaml"];

    for (const file of files) {
      expect(fs.existsSync(path.join(taxonomyDir, file))).toBe(true);
    }
  });
});
