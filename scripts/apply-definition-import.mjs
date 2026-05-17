import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const PROJECT_ROOT = process.cwd();

const ALLOWED_FILES = new Set([
  "categories.ts",
  "dimensions.ts",
  "option-sets.ts",
  "questions.ts",
  "sections.ts",
]);

const TARGET_DIR = path.join(PROJECT_ROOT, "lib", "scan", "definition");
const BACKUP_DIR = path.join(
  PROJECT_ROOT,
  ".definition-import-backups",
  createTimestamp()
);

function createTimestamp() {
  return new Date()
    .toISOString()
    .replaceAll(":", "-")
    .replaceAll(".", "-");
}

function fail(message) {
  console.error("");
  console.error(`❌ ${message}`);
  console.error("");
  process.exit(1);
}

function info(message) {
  console.log(`ℹ️  ${message}`);
}

function success(message) {
  console.log(`✅ ${message}`);
}

function readJsonFile(filePath) {
  if (!fs.existsSync(filePath)) {
    fail(`Importpakket niet gevonden: ${filePath}`);
  }

  const raw = fs.readFileSync(filePath, "utf8");

  try {
    return JSON.parse(raw);
  } catch (error) {
    fail(`Importpakket is geen geldige JSON: ${error.message}`);
  }
}

function validatePackage(importPackage) {
  if (!importPackage || typeof importPackage !== "object") {
    fail("Importpakket is leeg of ongeldig.");
  }

  if (importPackage.packageType !== "kweekers-definition-import-package") {
    fail(
      `Ongeldig packageType. Verwacht: kweekers-definition-import-package. Ontvangen: ${importPackage.packageType}`
    );
  }

  if (importPackage.packageVersion !== 1) {
    fail(
      `Ongeldige packageVersion. Verwacht: 1. Ontvangen: ${importPackage.packageVersion}`
    );
  }

  if (!Array.isArray(importPackage.files)) {
    fail("Importpakket bevat geen geldige files-array.");
  }

  if (importPackage.files.length === 0) {
    fail("Importpakket bevat geen bestanden om toe te passen.");
  }

  const mappingStatus = importPackage.mappingStatus;

  if (!mappingStatus || typeof mappingStatus !== "object") {
    fail("Importpakket bevat geen mappingStatus.");
  }

  if (Number(mappingStatus.missingRequiredFields ?? 0) > 0) {
    fail(
      `Import geblokkeerd: er missen nog verplichte velden (${mappingStatus.missingRequiredFields}).`
    );
  }

  if (Number(mappingStatus.filesWithAttention ?? 0) > 0) {
    fail(
      `Import geblokkeerd: er zijn nog bestanden met mapping-aandacht (${mappingStatus.filesWithAttention}).`
    );
  }

  for (const file of importPackage.files) {
    if (!file || typeof file !== "object") {
      fail("Importpakket bevat een ongeldig bestand-item.");
    }

    if (!ALLOWED_FILES.has(file.fileName)) {
      fail(`Bestand niet toegestaan: ${file.fileName}`);
    }

    if (typeof file.content !== "string" || file.content.trim().length === 0) {
      fail(`Bestand ${file.fileName} heeft geen geldige content.`);
    }

    if (typeof file.rowCount !== "number" || file.rowCount <= 0) {
      fail(`Bestand ${file.fileName} heeft geen geldige rowCount.`);
    }
  }
}

function ensureTargetDirectory() {
  if (!fs.existsSync(TARGET_DIR)) {
    fail(`Doelmap bestaat niet: ${TARGET_DIR}`);
  }
}

function backupExistingFile(fileName) {
  const sourcePath = path.join(TARGET_DIR, fileName);
  const backupPath = path.join(BACKUP_DIR, fileName);

  if (!fs.existsSync(sourcePath)) {
    fail(`Doelbestand bestaat niet: ${sourcePath}`);
  }

  fs.mkdirSync(BACKUP_DIR, { recursive: true });
  fs.copyFileSync(sourcePath, backupPath);

  return backupPath;
}

function writeTargetFile(fileName, content) {
  const targetPath = path.join(TARGET_DIR, fileName);
  const normalizedContent = content.endsWith("\n") ? content : `${content}\n`;

  fs.writeFileSync(targetPath, normalizedContent, "utf8");

  return targetPath;
}

function printPlan(importPackage) {
  console.log("");
  console.log("KWEEKERS Groeimodel — definition import apply");
  console.log("------------------------------------------------");
  console.log(`Package: ${importPackage.packageType}`);
  console.log(`Version: ${importPackage.packageVersion}`);
  console.log(`Generated at: ${importPackage.generatedAt ?? "onbekend"}`);
  console.log(`Mode: ${importPackage.source?.mode ?? "onbekend"}`);
  console.log("");
  console.log("Bestanden die worden toegepast:");

  for (const file of importPackage.files) {
    console.log(`- ${file.fileName} (${file.rowCount} regels)`);
  }

  console.log("");
}

function main() {
  const importPackagePath = process.argv[2];

  if (!importPackagePath) {
    fail(
      [
        "Geen importpakket opgegeven.",
        "",
        "Gebruik:",
        "npm run apply-definition-import -- ./pad/naar/definition-import-package.json",
      ].join("\n")
    );
  }

  const resolvedPackagePath = path.resolve(PROJECT_ROOT, importPackagePath);
  const importPackage = readJsonFile(resolvedPackagePath);

  validatePackage(importPackage);
  ensureTargetDirectory();
  printPlan(importPackage);

  info("Back-up wordt gemaakt...");

  for (const file of importPackage.files) {
    const backupPath = backupExistingFile(file.fileName);
    success(`Back-up gemaakt: ${backupPath}`);
  }

  console.log("");
  info("Definitiebestanden worden bijgewerkt...");

  for (const file of importPackage.files) {
    const targetPath = writeTargetFile(file.fileName, file.content);
    success(`Bijgewerkt: ${targetPath}`);
  }

  console.log("");
  success("Importpakket lokaal toegepast.");
  console.log("");
  console.log("Volgende controles:");
  console.log("1. npm run build");
  console.log("2. git diff");
  console.log("3. app lokaal testen");
  console.log("4. git add lib/scan/definition");
  console.log('5. git commit -m "Apply definition import package"');
  console.log("6. git push");
  console.log("");
}

main();