import fs from "node:fs/promises";
import path from "node:path";
export async function loadPrompt(name: string) {
  return fs.readFile(path.join(process.cwd(), "prompts", `${name}.yaml`), "utf8");
}
