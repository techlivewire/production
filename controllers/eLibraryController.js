// const ELibraryItem = require("../models/eLibraryModel");
// const path = require("path");
// const fs = require("fs");

// const ITEMS_PER_PAGE = 12;
// const ADMIN_PER_PAGE = 15;

// // ─── Query builder ────────────────────────────────────────────────────────────

// function buildQuery(q = {}) {
//   const filter = {};

//   // Type switch
//   if (q.libraryType) filter.libraryType = q.libraryType;

//   // Core shared filters
//   if (q.title)    filter.title    = { $regex: q.title.trim(), $options: "i" };
//   if (q.author)   filter.author   = { $regex: q.author.trim(), $options: "i" };
//   if (q.language) filter.language = q.language.trim();
//   if (q.fileFormat)    filter.fileFormat    = q.fileFormat.toUpperCase();
//   if (q.availability)  filter.availability  = q.availability;
//   if (q.readingLevel)  filter.readingLevel  = q.readingLevel;
//   if (q.isFeatured)    filter.isFeatured    = true;
//   if (q.isDownloadable) filter.isDownloadable = true;

//   if (q.tags) {
//     const tagList = q.tags.split(",").map(t => t.trim()).filter(Boolean);
//     if (tagList.length) filter.tags = { $in: tagList };
//   }

//   // ── Basic filters ──
//   if (q.category)      filter["basic.category"]      = { $regex: q.category.trim(), $options: "i" };
//   if (q.documentType)  filter["basic.documentType"]  = q.documentType;
//   if (q.publisher)     filter["basic.publisher"]     = { $regex: q.publisher.trim(), $options: "i" };
//   if (q.institution)   filter["basic.institution"]   = { $regex: q.institution.trim(), $options: "i" };
//   if (q.isPeerReviewed) filter["basic.isPeerReviewed"] = true;
//   if (q.course)        filter["basic.course"]        = { $regex: q.course.trim(), $options: "i" };
//   if (q.keywords) {
//     const kList = q.keywords.split(",").map(t => t.trim()).filter(Boolean);
//     if (kList.length) filter["basic.keywords"] = { $in: kList };
//   }

//   // ── Spiritual filters ──
//   if (q.scriptureName)    filter["spiritual.scriptureName"]    = { $regex: q.scriptureName.trim(), $options: "i" };
//   if (q.section)          filter["spiritual.section"]          = { $regex: q.section.trim(), $options: "i" };
//   if (q.shloka)           filter["spiritual.shloka"]           = { $regex: q.shloka.trim(), $options: "i" };
//   if (q.darshana)         filter["spiritual.darshana"]         = q.darshana;
//   if (q.sampradaya)       filter["spiritual.sampradaya"]       = q.sampradaya;
//   if (q.commentaryBy)     filter["spiritual.commentaryBy"]     = { $regex: q.commentaryBy.trim(), $options: "i" };
//   if (q.practiceType)     filter["spiritual.practiceType"]     = q.practiceType;
//   if (q.deity)            filter["spiritual.deity"]            = { $regex: q.deity.trim(), $options: "i" };
//   if (q.spiritualConcept) filter["spiritual.spiritualConcept"] = q.spiritualConcept;
//   if (q.yuga)             filter["spiritual.yuga"]             = q.yuga;
//   if (q.historicalPeriod) filter["spiritual.historicalPeriod"] = q.historicalPeriod;
//   if (q.audience)         filter["spiritual.audience"]         = q.audience;
//   if (q.lifestyle)        filter["spiritual.lifestyle"]        = q.lifestyle;
//   if (q.translationType)  filter["spiritual.translationType"]  = q.translationType;

//   return filter;
// }

// function buildSort(sort) {
//   switch (sort) {
//     case "mostViewed":    return { views: -1 };
//     case "mostDownloaded": return { downloads: -1 };
//     case "oldest":        return { createdAt: 1 };
//     case "az":            return { title: 1 };
//     case "featured":      return { isFeatured: -1, createdAt: -1 };
//     default:              return { createdAt: -1 };
//   }
// }

// // ─── Public: Advanced search page ────────────────────────────────────────────

// exports.searchPage = async (req, res) => {
//   try {
//     const page  = Math.max(1, parseInt(req.query.page) || 1);
//     const filter = buildQuery(req.query);
//     const sort   = buildSort(req.query.sort);
//     const hasSearch = Object.keys(req.query).some(k => k !== "page" && req.query[k]);

//     const [items, total] = await Promise.all([
//       ELibraryItem.find(filter)
//         .sort(sort)
//         .skip((page - 1) * ITEMS_PER_PAGE)
//         .limit(ITEMS_PER_PAGE)
//         .lean(),
//       ELibraryItem.countDocuments(filter),
//     ]);

//     // Distinct values for dropdowns
//     const [languages, categories, scriptureNames, deities] = await Promise.all([
//       ELibraryItem.distinct("language"),
//       ELibraryItem.distinct("basic.category"),
//       ELibraryItem.distinct("spiritual.scriptureName"),
//       ELibraryItem.distinct("spiritual.deity"),
//     ]);

//     res.render("elibrary/search", {
//       items,
//       total,
//       page,
//       totalPages: Math.ceil(total / ITEMS_PER_PAGE),
//       query: req.query,
//       hasSearch,
//       languages: languages.filter(Boolean).sort(),
//       categories: categories.filter(Boolean).sort(),
//       scriptureNames: scriptureNames.filter(Boolean).sort(),
//       deities: deities.filter(Boolean).sort(),
//     });
//   } catch (err) {
//     console.error("eLibrary search error:", err);
//     res.status(500).send("Failed to load eLibrary");
//   }
// };

// // ─── Public: View single item ─────────────────────────────────────────────────

// exports.viewItem = async (req, res) => {
//   try {
//     const item = await ELibraryItem.findByIdAndUpdate(
//       req.params.id,
//       { $inc: { views: 1 } },
//       { new: true }
//     ).lean();

//     if (!item) return res.status(404).send("Item not found");

//     const related = await ELibraryItem.find({
//       libraryType: item.libraryType,
//       _id: { $ne: item._id },
//       ...(item.libraryType === "spiritual"
//         ? { "spiritual.scriptureName": item.spiritual?.scriptureName || "" }
//         : { "basic.category": item.basic?.category || "" }),
//     }).limit(4).lean();

//     res.render("elibrary/item", { item, related });
//   } catch (err) {
//     console.error("eLibrary viewItem error:", err);
//     res.status(500).send("Failed to load item");
//   }
// };

// // ─── File serving (inline, view only) ────────────────────────────────────────

// exports.serveFile = async (req, res) => {
//   try {
//     const item = await ELibraryItem.findById(req.params.id).lean();
//     if (!item) return res.status(404).send("Not found");
//     if (item.availability === "restricted") return res.status(403).send("Restricted");
//     if (!item.fileUrl) return res.status(404).send("No file attached");

//     const filePath = path.join(__dirname, "../public", item.fileUrl);
//     if (!fs.existsSync(filePath)) return res.status(404).send("File not found on server");

//     res.setHeader("Content-Disposition", "inline");
//     res.setHeader("Content-Type", "application/pdf");
//     res.setHeader("Cache-Control", "no-store");
//     fs.createReadStream(filePath).pipe(res);
//   } catch (err) {
//     console.error("serveFile error:", err);
//     res.status(500).send("Failed to serve file");
//   }
// };

// // ─── Download (only if isDownloadable = true) ─────────────────────────────────

// exports.downloadItem = async (req, res) => {
//   try {
//     const item = await ELibraryItem.findById(req.params.id).lean();
//     if (!item) return res.status(404).send("Not found");
//     if (!item.isDownloadable) return res.status(403).send("Download not permitted");
//     if (!item.fileUrl) return res.status(404).send("No file attached");

//     const filePath = path.join(__dirname, "../public", item.fileUrl);
//     if (!fs.existsSync(filePath)) return res.status(404).send("File not found on server");

//     await ELibraryItem.findByIdAndUpdate(req.params.id, { $inc: { downloads: 1 } });

//     res.setHeader("Content-Disposition", `attachment; filename="${path.basename(filePath)}"`);
//     res.setHeader("Content-Type", "application/pdf");
//     fs.createReadStream(filePath).pipe(res);
//   } catch (err) {
//     console.error("Download error:", err);
//     res.status(500).send("Failed to process download");
//   }
// };

// // ─── Admin: list ──────────────────────────────────────────────────────────────

// exports.adminList = async (req, res) => {
//   try {
//     const page = Math.max(1, parseInt(req.query.page) || 1);
//     const typeFilter = req.query.type ? { libraryType: req.query.type } : {};

//     const [items, total] = await Promise.all([
//       ELibraryItem.find(typeFilter)
//         .sort({ createdAt: -1 })
//         .skip((page - 1) * ADMIN_PER_PAGE)
//         .limit(ADMIN_PER_PAGE)
//         .lean(),
//       ELibraryItem.countDocuments(typeFilter),
//     ]);

//     res.render("elibrary/admin/index", {
//       items,
//       total,
//       page,
//       totalPages: Math.ceil(total / ADMIN_PER_PAGE),
//       typeFilter: req.query.type || "",
//     });
//   } catch (err) {
//     console.error("Admin eLibrary list error:", err);
//     res.status(500).send("Failed to load admin eLibrary");
//   }
// };

// exports.adminAddForm = (req, res) => {
//   res.render("elibrary/admin/add", { error: null, values: {} });
// };

// exports.adminAdd = async (req, res) => {
//   try {
//     const b = req.body;

//     if (!b.title || !b.title.trim()) {
//       return res.render("elibrary/admin/add", { error: "Title is required", values: b });
//     }
//     if (!b.libraryType) {
//       return res.render("elibrary/admin/add", { error: "Library type is required", values: b });
//     }

//     const fileUrl = req.file ? "/uploads/" + req.file.filename : b.fileUrl || "";

//     const doc = {
//       libraryType:  b.libraryType,
//       title:        b.title.trim(),
//       author:       b.author?.trim() || "",
//       description:  b.description?.trim() || "",
//       language:     b.language?.trim() || "English",
//       publicationYear: b.publicationYear ? parseInt(b.publicationYear) : undefined,
//       tags:         b.tags ? b.tags.split(",").map(t => t.trim()).filter(Boolean) : [],
//       fileUrl,
//       fileFormat:   b.fileFormat || "",
//       availability: b.availability || "full",
//       isDownloadable: b.isDownloadable === "on" || b.isDownloadable === "true",
//       isFeatured:   b.isFeatured === "on" || b.isFeatured === "true",
//       readingLevel: b.readingLevel || "",
//     };

//     if (b.libraryType === "basic") {
//       doc.basic = {
//         category:     b.category?.trim() || "",
//         documentType: b.documentType || "",
//         keywords:     b.keywords ? b.keywords.split(",").map(t => t.trim()).filter(Boolean) : [],
//         publisher:    b.publisher?.trim() || "",
//         institution:  b.institution?.trim() || "",
//         isPeerReviewed: b.isPeerReviewed === "on",
//         course:       b.course?.trim() || "",
//       };
//     }

//     if (b.libraryType === "spiritual") {
//       doc.spiritual = {
//         scriptureName:    b.scriptureName?.trim() || "",
//         section:          b.section?.trim() || "",
//         shloka:           b.shloka?.trim() || "",
//         darshana:         b.darshana || "",
//         sampradaya:       b.sampradaya || "",
//         commentaryBy:     b.commentaryBy?.trim() || "",
//         practiceType:     b.practiceType || "",
//         deity:            b.deity?.trim() || "",
//         spiritualConcept: b.spiritualConcept || "",
//         yuga:             b.yuga || "",
//         historicalPeriod: b.historicalPeriod || "",
//         audience:         b.audience || "",
//         lifestyle:        b.lifestyle || "",
//         translationType:  b.translationType || "",
//       };
//     }

//     await ELibraryItem.create(doc);
//     res.redirect("/admin/elibrary");
//   } catch (err) {
//     console.error("Admin eLibrary add error:", err);
//     res.render("elibrary/admin/add", { error: err.message || "Failed to add item", values: req.body });
//   }
// };

// exports.adminEditForm = async (req, res) => {
//   try {
//     const item = await ELibraryItem.findById(req.params.id).lean();
//     if (!item) return res.status(404).send("Item not found");
//     res.render("elibrary/admin/edit", { item, error: null });
//   } catch (err) {
//     console.error("Admin eLibrary edit form error:", err);
//     res.status(500).send("Failed to load edit form");
//   }
// };

// exports.adminEdit = async (req, res) => {
//   try {
//     const b = req.body;

//     if (!b.title || !b.title.trim()) {
//       const item = await ELibraryItem.findById(req.params.id).lean();
//       return res.render("elibrary/admin/edit", { item, error: "Title is required" });
//     }

//     const fileUrl = req.file ? "/uploads/" + req.file.filename : b.existingFileUrl || "";

//     const update = {
//       title:        b.title.trim(),
//       author:       b.author?.trim() || "",
//       description:  b.description?.trim() || "",
//       language:     b.language?.trim() || "English",
//       publicationYear: b.publicationYear ? parseInt(b.publicationYear) : undefined,
//       tags:         b.tags ? b.tags.split(",").map(t => t.trim()).filter(Boolean) : [],
//       fileUrl,
//       fileFormat:   b.fileFormat || "",
//       availability: b.availability || "full",
//       isDownloadable: b.isDownloadable === "on" || b.isDownloadable === "true",
//       isFeatured:   b.isFeatured === "on" || b.isFeatured === "true",
//       readingLevel: b.readingLevel || "",
//     };

//     if (b.libraryType === "basic") {
//       update.basic = {
//         category:     b.category?.trim() || "",
//         documentType: b.documentType || "",
//         keywords:     b.keywords ? b.keywords.split(",").map(t => t.trim()).filter(Boolean) : [],
//         publisher:    b.publisher?.trim() || "",
//         institution:  b.institution?.trim() || "",
//         isPeerReviewed: b.isPeerReviewed === "on",
//         course:       b.course?.trim() || "",
//       };
//     }

//     if (b.libraryType === "spiritual") {
//       update.spiritual = {
//         scriptureName:    b.scriptureName?.trim() || "",
//         section:          b.section?.trim() || "",
//         shloka:           b.shloka?.trim() || "",
//         darshana:         b.darshana || "",
//         sampradaya:       b.sampradaya || "",
//         commentaryBy:     b.commentaryBy?.trim() || "",
//         practiceType:     b.practiceType || "",
//         deity:            b.deity?.trim() || "",
//         spiritualConcept: b.spiritualConcept || "",
//         yuga:             b.yuga || "",
//         historicalPeriod: b.historicalPeriod || "",
//         audience:         b.audience || "",
//         lifestyle:        b.lifestyle || "",
//         translationType:  b.translationType || "",
//       };
//     }

//     await ELibraryItem.findByIdAndUpdate(req.params.id, update);
//     res.redirect("/admin/elibrary");
//   } catch (err) {
//     console.error("Admin eLibrary edit error:", err);
//     const item = await ELibraryItem.findById(req.params.id).lean();
//     res.render("elibrary/admin/edit", { item, error: err.message || "Failed to update item" });
//   }
// };

// exports.adminDelete = async (req, res) => {
//   try {
//     await ELibraryItem.findByIdAndDelete(req.params.id);
//     res.redirect("/admin/elibrary");
//   } catch (err) {
//     console.error("Admin eLibrary delete error:", err);
//     res.status(500).send("Failed to delete item");
//   }
// };


const ELibraryItem = require("../models/eLibraryModel");
const path  = require("path");
const fs    = require("fs");
const XLSX  = require("xlsx");
const AdmZip = require("adm-zip");

const ITEMS_PER_PAGE = 12;
const ADMIN_PER_PAGE = 15;
const UPLOAD_DIR = path.join(__dirname, "../public/uploads");

// ─── Query builder ────────────────────────────────────────────────────────────

function buildQuery(q = {}) {
  const filter = {};
  if (q.libraryType) filter.libraryType = q.libraryType;
  if (q.title)    filter.title    = { $regex: q.title.trim(), $options: "i" };
  if (q.author)   filter.author   = { $regex: q.author.trim(), $options: "i" };
  if (q.language) filter.language = q.language.trim();
  if (q.fileFormat)     filter.fileFormat     = q.fileFormat.toUpperCase();
  if (q.availability)   filter.availability   = q.availability;
  if (q.readingLevel)   filter.readingLevel   = q.readingLevel;
  if (q.isFeatured)     filter.isFeatured     = true;
  if (q.isDownloadable) filter.isDownloadable = true;
  if (q.tags) {
    const tagList = q.tags.split(",").map(t => t.trim()).filter(Boolean);
    if (tagList.length) filter.tags = { $in: tagList };
  }
  if (q.category)       filter["basic.category"]       = { $regex: q.category.trim(), $options: "i" };
  if (q.documentType)   filter["basic.documentType"]   = q.documentType;
  if (q.publisher)      filter["basic.publisher"]      = { $regex: q.publisher.trim(), $options: "i" };
  if (q.institution)    filter["basic.institution"]    = { $regex: q.institution.trim(), $options: "i" };
  if (q.isPeerReviewed) filter["basic.isPeerReviewed"] = true;
  if (q.course)         filter["basic.course"]         = { $regex: q.course.trim(), $options: "i" };
  if (q.keywords) {
    const kList = q.keywords.split(",").map(t => t.trim()).filter(Boolean);
    if (kList.length) filter["basic.keywords"] = { $in: kList };
  }
  if (q.scriptureName)    filter["spiritual.scriptureName"]    = { $regex: q.scriptureName.trim(), $options: "i" };
  if (q.section)          filter["spiritual.section"]          = { $regex: q.section.trim(), $options: "i" };
  if (q.shloka)           filter["spiritual.shloka"]           = { $regex: q.shloka.trim(), $options: "i" };
  if (q.darshana)         filter["spiritual.darshana"]         = q.darshana;
  if (q.sampradaya)       filter["spiritual.sampradaya"]       = q.sampradaya;
  if (q.commentaryBy)     filter["spiritual.commentaryBy"]     = { $regex: q.commentaryBy.trim(), $options: "i" };
  if (q.practiceType)     filter["spiritual.practiceType"]     = q.practiceType;
  if (q.deity)            filter["spiritual.deity"]            = { $regex: q.deity.trim(), $options: "i" };
  if (q.spiritualConcept) filter["spiritual.spiritualConcept"] = q.spiritualConcept;
  if (q.yuga)             filter["spiritual.yuga"]             = q.yuga;
  if (q.historicalPeriod) filter["spiritual.historicalPeriod"] = q.historicalPeriod;
  if (q.audience)         filter["spiritual.audience"]         = q.audience;
  if (q.lifestyle)        filter["spiritual.lifestyle"]        = q.lifestyle;
  if (q.translationType)  filter["spiritual.translationType"]  = q.translationType;
  return filter;
}

function buildSort(sort) {
  switch (sort) {
    case "mostViewed":     return { views: -1 };
    case "mostDownloaded": return { downloads: -1 };
    case "oldest":         return { createdAt: 1 };
    case "az":             return { title: 1 };
    case "featured":       return { isFeatured: -1, createdAt: -1 };
    default:               return { createdAt: -1 };
  }
}

// ─── Import helpers ───────────────────────────────────────────────────────────

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
  if (!str(row.title)) return { doc: null, reason: "Missing title" };
  if (!type)           return { doc: null, reason: "libraryType must be 'spiritual' or 'basic'" };

  let fileUrl = "";
  let fileWarning = null;
  const fileName = str(row.fileName);
  if (fileName) {
    if (extractedFiles[fileName.toLowerCase()]) {
      fileUrl = "/uploads/" + fileName;
    } else {
      fileWarning = `fileName "${fileName}" not found in ZIP`;
    }
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
      category:      str(row.category),
      documentType:  matchEnum(str(row.documentType), ["book","journal","thesis","report","article"]),
      keywords:      toArray(row.keywords),
      publisher:     str(row.publisher),
      institution:   str(row.institution),
      isPeerReviewed: bool(row.isPeerReviewed),
      course:        str(row.course),
    };
    doc.spiritual = {};
  }

  if (type === "spiritual") {
    doc.spiritual = {
      scriptureName:    str(row.scriptureName),
      section:          str(row.section),
      shloka:           str(row.shloka),
      darshana:         matchEnum(str(row.darshana),         ["Vedanta","Samkhya","Yoga","Nyaya","Vaisheshika","Mimamsa"]),
      sampradaya:       matchEnum(str(row.sampradaya),       ["Vaishnav","Shaiva","Shakta","Smarta"]),
      commentaryBy:     str(row.commentaryBy),
      practiceType:     matchEnum(str(row.practiceType),     ["Meditation","Yoga","Bhakti","Karma","Mantra","Ritual"]),
      deity:            str(row.deity),
      spiritualConcept: matchEnum(str(row.spiritualConcept), ["Dharma","Karma","Moksha","Atman","Brahman","Maya"]),
      yuga:             matchEnum(str(row.yuga),             ["Satya","Treta","Dvapara","Kali"]),
      historicalPeriod: matchEnum(str(row.historicalPeriod), ["Vedic","Epic","Puranic","Medieval","Modern"]),
      translationType:  matchEnum(str(row.translationType),  ["Original Sanskrit","Translation","Commentary","Simplified","Scholarly"]),
      audience:         matchEnum(str(row.audience),         ["Beginner/Seeker","Practitioner","Advanced","Children/Youth","Scholars"]),
      lifestyle:        matchEnum(str(row.lifestyle),        ["Ayurveda","Dinacharya","Ethics"]),
    };
    doc.basic = {};
  }

  return { doc, fileWarning };
}

// ─── Public routes ────────────────────────────────────────────────────────────

exports.searchPage = async (req, res) => {
  try {
    const page   = Math.max(1, parseInt(req.query.page) || 1);
    const filter = buildQuery(req.query);
    const sort   = buildSort(req.query.sort);
    const hasSearch = Object.keys(req.query).some(k => k !== "page" && req.query[k]);

    const [items, total] = await Promise.all([
      ELibraryItem.find(filter).sort(sort).skip((page - 1) * ITEMS_PER_PAGE).limit(ITEMS_PER_PAGE).lean(),
      ELibraryItem.countDocuments(filter),
    ]);

    const [languages, categories, scriptureNames, deities] = await Promise.all([
      ELibraryItem.distinct("language"),
      ELibraryItem.distinct("basic.category"),
      ELibraryItem.distinct("spiritual.scriptureName"),
      ELibraryItem.distinct("spiritual.deity"),
    ]);

    res.render("elibrary/search", {
      items, total, page,
      totalPages: Math.ceil(total / ITEMS_PER_PAGE),
      query: req.query,
      hasSearch,
      languages:     languages.filter(Boolean).sort(),
      categories:    categories.filter(Boolean).sort(),
      scriptureNames: scriptureNames.filter(Boolean).sort(),
      deities:       deities.filter(Boolean).sort(),
    });
  } catch (err) {
    console.error("eLibrary search error:", err);
    res.status(500).send("Failed to load eLibrary");
  }
};

exports.viewItem = async (req, res) => {
  try {
    const item = await ELibraryItem.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    ).lean();
    if (!item) return res.status(404).send("Item not found");

    const related = await ELibraryItem.find({
      libraryType: item.libraryType,
      _id: { $ne: item._id },
      ...(item.libraryType === "spiritual"
        ? { "spiritual.scriptureName": item.spiritual?.scriptureName || "" }
        : { "basic.category": item.basic?.category || "" }),
    }).limit(4).lean();

    res.render("elibrary/item", { item, related });
  } catch (err) {
    console.error("eLibrary viewItem error:", err);
    res.status(500).send("Failed to load item");
  }
};

exports.serveFile = async (req, res) => {
  try {
    const item = await ELibraryItem.findById(req.params.id).lean();
    if (!item) return res.status(404).send("Not found");
    if (item.availability === "restricted") return res.status(403).send("Restricted");
    if (!item.fileUrl) return res.status(404).send("No file attached");

    const filePath = path.join(__dirname, "../public", item.fileUrl);
    if (!fs.existsSync(filePath)) return res.status(404).send("File not found on server");

    res.setHeader("Content-Disposition", "inline");
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Cache-Control", "no-store");
    fs.createReadStream(filePath).pipe(res);
  } catch (err) {
    console.error("serveFile error:", err);
    res.status(500).send("Failed to serve file");
  }
};

exports.downloadItem = async (req, res) => {
  try {
    const item = await ELibraryItem.findById(req.params.id).lean();
    if (!item) return res.status(404).send("Not found");
    if (!item.isDownloadable) return res.status(403).send("Download not permitted");
    if (!item.fileUrl) return res.status(404).send("No file attached");

    const filePath = path.join(__dirname, "../public", item.fileUrl);
    if (!fs.existsSync(filePath)) return res.status(404).send("File not found on server");

    await ELibraryItem.findByIdAndUpdate(req.params.id, { $inc: { downloads: 1 } });
    res.setHeader("Content-Disposition", `attachment; filename="${path.basename(filePath)}"`);
    res.setHeader("Content-Type", "application/pdf");
    fs.createReadStream(filePath).pipe(res);
  } catch (err) {
    console.error("Download error:", err);
    res.status(500).send("Failed to process download");
  }
};

// ─── Admin: list ──────────────────────────────────────────────────────────────

exports.adminList = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const typeFilter = req.query.type ? { libraryType: req.query.type } : {};

    const [items, total] = await Promise.all([
      ELibraryItem.find(typeFilter).sort({ createdAt: -1 }).skip((page - 1) * ADMIN_PER_PAGE).limit(ADMIN_PER_PAGE).lean(),
      ELibraryItem.countDocuments(typeFilter),
    ]);

    res.render("elibrary/admin/index", {
      items, total, page,
      totalPages: Math.ceil(total / ADMIN_PER_PAGE),
      typeFilter: req.query.type || "",
    });
  } catch (err) {
    console.error("Admin eLibrary list error:", err);
    res.status(500).send("Failed to load admin eLibrary");
  }
};

// ─── Admin: import (browser-based) ───────────────────────────────────────────

exports.adminImportForm = (req, res) => {
  res.render("elibrary/admin/import", { result: null });
};

exports.adminImport = async (req, res) => {
  const tempFiles = [];

  try {
    // Validate uploads
    if (!req.files || !req.files.excel || !req.files.excel[0]) {
      return res.render("elibrary/admin/import", {
        result: { success: false, error: "Excel file is required." }
      });
    }
    if (!req.files.zip || !req.files.zip[0]) {
      return res.render("elibrary/admin/import", {
        result: { success: false, error: "ZIP file is required." }
      });
    }

    const excelFile = req.files.excel[0];
    const zipFile   = req.files.zip[0];

    tempFiles.push(excelFile.path, zipFile.path);

    // Ensure upload dir exists
    if (!fs.existsSync(UPLOAD_DIR)) {
      fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    }

    // Extract ZIP
    const zip = new AdmZip(zipFile.path);
    const zipEntries = zip.getEntries();
    const extractedFiles = {};
    let extractedCount = 0;

    zipEntries.forEach(entry => {
      if (entry.isDirectory) return;
      const fileName = path.basename(entry.entryName);
      zip.extractEntryTo(entry, UPLOAD_DIR, false, true);
      extractedFiles[fileName.toLowerCase()] = true;
      extractedCount++;
    });

    // Read Excel
    const workbook = XLSX.readFile(excelFile.path);
    const sheetName = workbook.SheetNames[0];
    const rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { defval: "" });

    // Process rows
    let inserted = 0;
    let skipped  = 0;
    let errors   = 0;
    const log    = [];

    for (let i = 0; i < rows.length; i++) {
      const row    = rows[i];
      const rowNum = i + 2;

      try {
        const { doc, fileWarning, reason } = parseRow(row, extractedFiles);

        if (!doc) {
          skipped++;
          log.push({ type: "skip", row: rowNum, title: str(row.title) || "(empty)", msg: reason });
          continue;
        }

        if (fileWarning) {
          log.push({ type: "warn", row: rowNum, title: doc.title, msg: fileWarning });
        }

        await ELibraryItem.create(doc);
        inserted++;
        log.push({ type: "ok", row: rowNum, title: doc.title, msg: `Imported as ${doc.libraryType}` });

      } catch (err) {
        errors++;
        log.push({ type: "error", row: rowNum, title: str(row.title), msg: err.message });
      }
    }

    // Cleanup temp files
    tempFiles.forEach(f => { try { fs.unlinkSync(f); } catch(e) {} });

    return res.render("elibrary/admin/import", {
      result: {
        success: true,
        total:    rows.length,
        inserted,
        skipped,
        errors,
        extracted: extractedCount,
        log,
      }
    });

  } catch (err) {
    console.error("Bulk import error:", err);
    tempFiles.forEach(f => { try { fs.unlinkSync(f); } catch(e) {} });
    return res.render("elibrary/admin/import", {
      result: { success: false, error: err.message }
    });
  }
};

// ─── Admin: add / edit / delete ───────────────────────────────────────────────

exports.adminAddForm = (req, res) => {
  res.render("elibrary/admin/add", { error: null, values: {} });
};

exports.adminAdd = async (req, res) => {
  try {
    const b = req.body;
    if (!b.title || !b.title.trim()) {
      return res.render("elibrary/admin/add", { error: "Title is required", values: b });
    }
    if (!b.libraryType) {
      return res.render("elibrary/admin/add", { error: "Library type is required", values: b });
    }

    const fileUrl = req.file ? "/uploads/" + req.file.filename : b.fileUrl || "";
    const doc = buildDocFromBody(b, fileUrl);
    await ELibraryItem.create(doc);
    res.redirect("/admin/elibrary");
  } catch (err) {
    console.error("Admin eLibrary add error:", err);
    res.render("elibrary/admin/add", { error: err.message || "Failed to add item", values: req.body });
  }
};

exports.adminEditForm = async (req, res) => {
  try {
    const item = await ELibraryItem.findById(req.params.id).lean();
    if (!item) return res.status(404).send("Item not found");
    res.render("elibrary/admin/edit", { item, error: null });
  } catch (err) {
    console.error("Admin eLibrary edit form error:", err);
    res.status(500).send("Failed to load edit form");
  }
};

exports.adminEdit = async (req, res) => {
  try {
    const b = req.body;
    if (!b.title || !b.title.trim()) {
      const item = await ELibraryItem.findById(req.params.id).lean();
      return res.render("elibrary/admin/edit", { item, error: "Title is required" });
    }

    const fileUrl = req.file ? "/uploads/" + req.file.filename : b.existingFileUrl || "";
    const update  = buildDocFromBody(b, fileUrl);
    await ELibraryItem.findByIdAndUpdate(req.params.id, update);
    res.redirect("/admin/elibrary");
  } catch (err) {
    console.error("Admin eLibrary edit error:", err);
    const item = await ELibraryItem.findById(req.params.id).lean();
    res.render("elibrary/admin/edit", { item, error: err.message || "Failed to update item" });
  }
};

exports.adminDelete = async (req, res) => {
  try {
    await ELibraryItem.findByIdAndDelete(req.params.id);
    res.redirect("/admin/elibrary");
  } catch (err) {
    console.error("Admin eLibrary delete error:", err);
    res.status(500).send("Failed to delete item");
  }
};

// ─── Shared body parser ───────────────────────────────────────────────────────

function buildDocFromBody(b, fileUrl) {
  const doc = {
    libraryType:     b.libraryType,
    title:           b.title.trim(),
    author:          b.author?.trim() || "",
    description:     b.description?.trim() || "",
    language:        b.language?.trim() || "English",
    publicationYear: b.publicationYear ? parseInt(b.publicationYear) : undefined,
    tags:            b.tags ? b.tags.split(",").map(t => t.trim()).filter(Boolean) : [],
    fileUrl,
    fileFormat:      b.fileFormat || "",
    availability:    b.availability || "full",
    isDownloadable:  b.isDownloadable === "on" || b.isDownloadable === "true",
    isFeatured:      b.isFeatured === "on" || b.isFeatured === "true",
    readingLevel:    b.readingLevel || "",
  };

  if (b.libraryType === "basic") {
    doc.basic = {
      category:      b.category?.trim() || "",
      documentType:  b.documentType || "",
      keywords:      b.keywords ? b.keywords.split(",").map(t => t.trim()).filter(Boolean) : [],
      publisher:     b.publisher?.trim() || "",
      institution:   b.institution?.trim() || "",
      isPeerReviewed: b.isPeerReviewed === "on",
      course:        b.course?.trim() || "",
    };
    doc.spiritual = {};
  }

  if (b.libraryType === "spiritual") {
    doc.spiritual = {
      scriptureName:    b.scriptureName?.trim() || "",
      section:          b.section?.trim() || "",
      shloka:           b.shloka?.trim() || "",
      darshana:         b.darshana || "",
      sampradaya:       b.sampradaya || "",
      commentaryBy:     b.commentaryBy?.trim() || "",
      practiceType:     b.practiceType || "",
      deity:            b.deity?.trim() || "",
      spiritualConcept: b.spiritualConcept || "",
      yuga:             b.yuga || "",
      historicalPeriod: b.historicalPeriod || "",
      translationType:  b.translationType || "",
      audience:         b.audience || "",
      lifestyle:        b.lifestyle || "",
    };
    doc.basic = {};
  }

  return doc;
}