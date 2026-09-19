import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const required = [
  "README.md",
  "ARCHITECTURE.md",
  "PRODUCT-ARCHITECTURE.md",
  "PRODUCT-REQUIREMENTS.md",
  "THREAT-MODEL.md",
  "TESTING-AND-EVALUATION.md",
  "OPERATIONS.md",
  "UPDATE-AND-DEFENSE-LIFECYCLE.md",
  "ROADMAP.md",
  "ASSURANCE-AND-AUDIT.md",
  "FAILURE-MODES.md",
  "SECURITY-CLAIMS.md",
  "REFERENCES.md",
  "DIAGRAMS.md"
];

const forbiddenAbsoluteClaims = [
  "100% secure",
  "impossible to hack",
  "zero vulnerabilities",
  "guaranteed against all attacks",
  "protects every device"
];

const failures = [];

for (const file of required) {
  if (!fs.existsSync(path.join(root, file))) failures.push(`missing required document: ${file}`);
}

const diagrams = fs.readFileSync(path.join(root, "DIAGRAMS.md"), "utf8");
if (!diagrams.includes("mermaid")) failures.push("DIAGRAMS.md does not contain Mermaid diagrams");

const claims = fs.readFileSync(path.join(root, "SECURITY-CLAIMS.md"), "utf8").toLowerCase();
for (const phrase of forbiddenAbsoluteClaims) {
  if (claims.includes(phrase.toLowerCase())) {
    failures.push(`SECURITY-CLAIMS.md contains prohibited absolute claim: "${phrase}"`);
  }
}

const roadmap = fs.readFileSync(path.join(root, "ROADMAP.md"), "utf8");
if (!roadmap.includes("Definition of done")) failures.push("ROADMAP.md is missing Definition of done");

if (failures.length) {
  console.error("AYORAI RESEARCH VALIDATION: FAILED");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("AYORAI RESEARCH VALIDATION: PASSED");
console.log(`Required documents checked: ${required.length}`);
console.log("Security-claim guard: passed");
console.log("Architecture diagram guard: passed");
