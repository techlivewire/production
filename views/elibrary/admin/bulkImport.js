


/**
 * ─────────────────────────────────────────────────────────────────────────────
 * eLibrary Bulk Import Script
 * Usage: node scripts/bulkImport.js --excel=data.xlsx --zip=files.zip
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * HOW IT WORKS:
 *  1. Reads your Excel file row by row
 *  2. Extracts your ZIP of PDFs into public/uploads/
 *  3. Matches each row's "fileName" column to an extracted file
 *  4. Saves every row as an ELibraryItem in MongoDB
 *
 * REQUIRED packages (run once in your project root):
 *   npm install xlsx adm-zip
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * EXCEL COLUMN REFERENCE
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * REQUIRED (must not be empty):
 *   title          - Title of the document
 *   libraryType    - "spiritual" OR "basic"  (case insensitive)
 *
 * OPTIONAL SHARED FIELDS:
 *   author         - Author or commentator name
 *   description    - Short description
 *   language       - English / Hindi / Sanskrit / Tamil etc.
 *   publicationYear- e.g. 2021
 *   tags           - Comma separated: yoga, dharma, karma
 *   fileFormat     - PDF / EPUB / DOC
 *   fileName       - Exact filename in ZIP e.g. bhagavad-gita.pdf
 *   availability   - full / preview / restricted   (default: full)
 *   isDownloadable - TRUE / FALSE                  (default: FALSE)
 *   isFeatured     - TRUE / FALSE                  (default: FALSE)
 *   readingLevel   - beginner / intermediate / advanced
 *
 * BASIC / ACADEMIC FIELDS (only used when libraryType = basic):
 *   category       - Science / History / Literature etc.
 *   documentType   - book / journal / thesis / report / article
 *   publisher      - Publisher name
 *   institution    - University or institution
 *   course         - Course or curriculum name
 *   keywords       - Comma separated: AI, climate change
 *   isPeerReviewed - TRUE / FALSE
 *
 * SPIRITUAL FIELDS (only used when libraryType = spiritual):
 *   scriptureName  - Bhagavad Gita / Rigveda / Upanishads etc.
 *   section        - Chapter or Adhyaya e.g. Adhyaya 2
 *   shloka         - Verse reference e.g. 2.47
 *   darshana       - Vedanta / Samkhya / Yoga / Nyaya / Vaisheshika / Mimamsa
 *   sampradaya     - Vaishnav / Shaiva / Shakta / Smarta
 *   commentaryBy   - e.g. Adi Shankaracharya
 *   practiceType   - Meditation / Yoga / Bhakti / Karma / Mantra / Ritual
 *   deity          - Krishna / Shiva / Durga etc.
 *   spiritualConcept - Dharma / Karma / Moksha / Atman / Brahman / Maya
 *   yuga           - Satya / Treta / Dvapara / Kali
 *   historicalPeriod - Vedic / Epic / Puranic / Medieval / Modern
 *   translationType  - Original Sanskrit / Translation / Commentary / Simplified / Scholarly
 *   audience       - Beginner/Seeker / Practitioner / Advanced / Children/Youth / Scholars
 *   lifestyle      - Ayurveda / Dinacharya / Ethics
 *
 * ─────────────────────────────────────────────────────────────────────────────
 */

require("dotenv").config();
const path    = require("path");
const fs      = require("fs");
const XLSX    = require("xlsx");
const AdmZip  = require("adm-zip");
const mongoose = require("mongoose");


console.log("RUNNING FILE:", __filename);
console.log("master")

// ── Parse CLI args ────────────────────────────────────────────────────────────
const args = {};
process.argv.slice(2).forEach(arg => {
  const [key, val] = arg.replace("--", "").split("=");
  args[key] = val;
});

if (!args.excel || !args.zip) {
  console.error("\n❌  Usage: node scripts/bulkImport.js --excel=data.xlsx --zip=files.zip\n");
  process.exit(1);
}

const EXCEL_PATH   = path.resolve(args.excel);
const ZIP_PATH     = path.resolve(args.zip);
const UPLOAD_DIR   = path.resolve(__dirname, "../public/uploads");
const MONGO_URI    = process.env.MONGO_URI || 'mongodb+srv://eLibrarySystem:eLibrarySystem@cluster0.9mxtrby.mongodb.net/journaldb?retryWrites=true&w=majority&appName=Cluster0';



if (!fs.existsSync(EXCEL_PATH)) {
  console.error(`\n❌  Excel file not found: ${EXCEL_PATH}\n`);
  process.exit(1);
}

if (!fs.existsSync(ZIP_PATH)) {
  console.error(`\n❌  ZIP file not found: ${ZIP_PATH}\n`);
  process.exit(1);
}

// ── Load ELibraryItem model ───────────────────────────────────────────────────
// Load directly so this script works standalone without the full express app
const eLibraryItemSchema = new mongoose.Schema(
  {
    libraryType:  { type: String, enum: ["spiritual","basic"], required: true },
    title:        { type: String, required: true, trim: true },
    author:       { type: String, trim: true, default: "" },
    description:  { type: String, trim: true, default: "" },
    language:     { type: String, trim: true, default: "English" },
    publicationYear: { type: Number },
    tags:         { type: [String], default: [] },
    fileUrl:      { type: String, default: "" },
    fileFormat:   { type: String, enum: ["PDF","EPUB","DOC",""], default: "" },
    availability: { type: String, enum: ["full","preview","restricted"], default: "full" },
    isDownloadable: { type: Boolean, default: false },
    isFeatured:   { type: Boolean, default: false },
    views:        { type: Number, default: 0 },
    downloads:    { type: Number, default: 0 },
    readingLevel: { type: String, enum: ["beginner","intermediate","advanced",""], default: "" },
    basic: {
      category:     { type: String, default: "" },
      documentType: { type: String, enum: ["book","journal","thesis","report","article",""], default: "" },
      keywords:     { type: [String], default: [] },
      publisher:    { type: String, default: "" },
      institution:  { type: String, default: "" },
      isPeerReviewed: { type: Boolean, default: false },
      course:       { type: String, default: "" },
    },
    spiritual: {
      scriptureName:    { type: String, default: "" },
      section:          { type: String, default: "" },
      shloka:           { type: String, default: "" },
      darshana:         { type: String, enum: ["Vedanta","Samkhya","Yoga","Nyaya","Vaisheshika","Mimamsa",""], default: "" },
      sampradaya:       { type: String, enum: ["Vaishnav","Shaiva","Shakta","Smarta",""], default: "" },
      commentaryBy:     { type: String, default: "" },
      practiceType:     { type: String, enum: ["Meditation","Yoga","Bhakti","Karma","Mantra","Ritual",""], default: "" },
      deity:            { type: String, default: "" },
      spiritualConcept: { type: String, enum: ["Dharma","Karma","Moksha","Atman","Brahman","Maya",""], default: "" },
      yuga:             { type: String, enum: ["Satya","Treta","Dvapara","Kali",""], default: "" },
      historicalPeriod: { type: String, enum: ["Vedic","Epic","Puranic","Medieval","Modern",""], default: "" },
      audience:         { type: String, enum: ["Beginner/Seeker","Practitioner","Advanced","Children/Youth","Scholars",""], default: "" },
      lifestyle:        { type: String, enum: ["Ayurveda","Dinacharya","Ethics",""], default: "" },
      translationType:  { type: String, enum: ["Original Sanskrit","Translation","Commentary","Simplified","Scholarly",""], default: "" },
    },
  },
  { timestamps: true }
);

// ── Helpers ───────────────────────────────────────────────────────────────────

function str(val) {
  if (val === undefined || val === null) return "";
  return String(val).trim();
}

function bool(val) {
  const s = str(val).toUpperCase();
  return s === "TRUE" || s === "YES" || s === "1";
}

function toArray(val) {
  if (!val) return [];
  return str(val).split(",").map(s => s.trim()).filter(Boolean);
}

function matchEnum(val, allowed) {
  if (!val) return "";
  const s = str(val);
  const found = allowed.find(a => a.toLowerCase() === s.toLowerCase());
  return found || "";
}

function parseRow(row, extractedFiles) {
  const type = matchEnum(str(row.libraryType), ["spiritual", "basic"]);

  if (!str(row.title)) return null;
  if (!type) return null;

  // Match file from extracted ZIP
  let fileUrl = "";
  const fileName = str(row.fileName);
  if (fileName && extractedFiles[fileName.toLowerCase()]) {
    fileUrl = "/uploads/" + fileName;
  }

  const doc = {
    libraryType:     type,
    title:           str(row.title),
    author:          str(row.author),
    description:     str(row.description),
    language:        str(row.language) || "English",
    publicationYear: row.publicationYear ? parseInt(row.publicationYear) : undefined,
    tags:            toArray(row.tags),
    fileUrl,
    fileFormat:      matchEnum(str(row.fileFormat), ["PDF","EPUB","DOC"]),
    availability:    matchEnum(str(row.availability), ["full","preview","restricted"]) || "full",
    isDownloadable:  bool(row.isDownloadable),
    isFeatured:      bool(row.isFeatured),
    readingLevel:    matchEnum(str(row.readingLevel), ["beginner","intermediate","advanced"]),
  };

  if (type === "basic") {
    doc.basic = {
      category:     str(row.category),
      documentType: matchEnum(str(row.documentType), ["book","journal","thesis","report","article"]),
      keywords:     toArray(row.keywords),
      publisher:    str(row.publisher),
      institution:  str(row.institution),
      isPeerReviewed: bool(row.isPeerReviewed),
      course:       str(row.course),
    };
    doc.spiritual = {};
  }

  if (type === "spiritual") {
    doc.spiritual = {
      scriptureName:    str(row.scriptureName),
      section:          str(row.section),
      shloka:           str(row.shloka),
      darshana:         matchEnum(str(row.darshana), ["Vedanta","Samkhya","Yoga","Nyaya","Vaisheshika","Mimamsa"]),
      sampradaya:       matchEnum(str(row.sampradaya), ["Vaishnav","Shaiva","Shakta","Smarta"]),
      commentaryBy:     str(row.commentaryBy),
      practiceType:     matchEnum(str(row.practiceType), ["Meditation","Yoga","Bhakti","Karma","Mantra","Ritual"]),
      deity:            str(row.deity),
      spiritualConcept: matchEnum(str(row.spiritualConcept), ["Dharma","Karma","Moksha","Atman","Brahman","Maya"]),
      yuga:             matchEnum(str(row.yuga), ["Satya","Treta","Dvapara","Kali"]),
      historicalPeriod: matchEnum(str(row.historicalPeriod), ["Vedic","Epic","Puranic","Medieval","Modern"]),
      translationType:  matchEnum(str(row.translationType), ["Original Sanskrit","Translation","Commentary","Simplified","Scholarly"]),
      audience:         matchEnum(str(row.audience), ["Beginner/Seeker","Practitioner","Advanced","Children/Youth","Scholars"]),
      lifestyle:        matchEnum(str(row.lifestyle), ["Ayurveda","Dinacharya","Ethics"]),
    };
    doc.basic = {};
  }

  return doc;
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log("\n🚀  eLibrary Bulk Import Started\n");

  // 1. Extract ZIP into public/uploads/
  console.log("📦  Extracting ZIP...");
  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  }

  const zip = new AdmZip(ZIP_PATH);
  const zipEntries = zip.getEntries();
  const extractedFiles = {}; // lowercase filename → true

  let extractedCount = 0;
  zipEntries.forEach(entry => {
    if (entry.isDirectory) return;
    const fileName = path.basename(entry.entryName);
    const destPath = path.join(UPLOAD_DIR, fileName);
    zip.extractEntryTo(entry, UPLOAD_DIR, false, true);
    extractedFiles[fileName.toLowerCase()] = true;
    extractedCount++;
  });
  console.log(`   ✅  ${extractedCount} files extracted to public/uploads/\n`);

  // 2. Read Excel
  console.log("📊  Reading Excel file...");
  const workbook = XLSX.readFile(EXCEL_PATH);
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });
  console.log(`   ✅  ${rows.length} rows found in sheet "${sheetName}"\n`);

  // 3. Connect MongoDB
  console.log("🔌  Connecting to MongoDB...");
  await mongoose.connect(MONGO_URI);
  console.log("   ✅  Connected\n");

  const ELibraryItem = mongoose.model("ELibraryItem", eLibraryItemSchema);

  // 4. Process rows
  console.log("📥  Importing rows...\n");

  let inserted = 0;
  let skipped  = 0;
  let errors   = 0;
  const skippedRows = [];
  const errorRows   = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowNum = i + 2; // Excel row number (1-indexed + header)

    try {
      const doc = parseRow(row, extractedFiles);

      if (!doc) {
        skipped++;
        skippedRows.push({
          row: rowNum,
          title: str(row.title) || "(empty)",
          reason: !str(row.title) ? "Missing title" : "Invalid or missing libraryType (must be spiritual or basic)"
        });
        continue;
      }

      // Warn if fileName was given but file not found in ZIP
      if (str(row.fileName) && !extractedFiles[str(row.fileName).toLowerCase()]) {
        console.warn(`   ⚠️   Row ${rowNum}: fileName "${row.fileName}" not found in ZIP — saved without file`);
      }

      await ELibraryItem.create(doc);
      inserted++;
      console.log(`   ✅  Row ${rowNum}: "${doc.title}" [${doc.libraryType}]`);

    // } 
    // catch (err) {
    //   errors++;
    //   errorRows.push({ row: rowNum, title: str(row.title), error: err.message });
    //   console.error(`   ❌  Row ${rowNum}: "${str(row.title)}" — ${err.message}`);
    // }
    
    } catch (err) {
  errors++;
  console.error("FULL ERROR OBJECT:", err);
  console.error("STACK TRACE:\n", err.stack);
}
  }

  // 5. Summary
  console.log("\n─────────────────────────────────────────────");
  console.log(`📋  IMPORT SUMMARY`);
  console.log(`─────────────────────────────────────────────`);
  console.log(`   Total rows    : ${rows.length}`);
  console.log(`   ✅ Inserted   : ${inserted}`);
  console.log(`   ⏭️  Skipped    : ${skipped}`);
  console.log(`   ❌ Errors     : ${errors}`);
  console.log(`─────────────────────────────────────────────\n`);

  if (skippedRows.length) {
    console.log("⏭️  SKIPPED ROWS:");
    skippedRows.forEach(r => console.log(`   Row ${r.row} "${r.title}" → ${r.reason}`));
    console.log("");
  }

  if (errorRows.length) {
    console.log("❌  ERROR ROWS:");
    errorRows.forEach(r => console.log(`   Row ${r.row} "${r.title}" → ${r.error}`));
    console.log("");
  }

  await mongoose.disconnect();
  console.log("✅  Done. MongoDB disconnected.\n");
}

main().catch(err => {
  console.error("\n💥  Fatal error:", err.message);
  process.exit(1);
});