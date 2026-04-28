import "dotenv/config";
import { generateExplanationWithFallback } from "../lib/ai/retry";

async function main() {
  const result = await generateExplanationWithFallback({
    stem: "A researcher mutates a protein so that a lysine residue in the active site is replaced with glutamate. The mutation decreases binding to a negatively charged substrate. Which explanation best accounts for the decreased binding?",
    choices: [
      { label: "A", text: "Glutamate is larger than lysine, causing steric hindrance in the active site." },
      { label: "B", text: "Lysine and glutamate are both nonpolar, but glutamate is less flexible." },
      { label: "C", text: "Lysine is positively charged, while glutamate is negatively charged, reducing attraction to the substrate." },
      { label: "D", text: "Glutamate forms stronger hydrophobic interactions than lysine." },
    ],
    correctLabel: "C",
    selectedLabel: "B",
    topicContext: "Amino acids",
    confidence: 3,
  });

  console.log(JSON.stringify(result, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
