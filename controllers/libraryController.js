const LibraryItem = require("../models/libraryModel");
const path = require("path");
const fs = require("fs");

const ITEMS_PER_PAGE = 9;

// ─── helpers ──────────────────────────────────────────────────────────────────

function buildQuery(q = {}) {
  const filter = {};

  if (q.title) {
    filter.title = { $regex: q.title.trim(), $options: "i" };
  }
  if (q.author) {
    filter.author = { $regex: q.author.trim(), $options: "i" };
  }
  if (q.category) {
    filter.category = q.category.trim();
  }
  if (q.tags) {
    const tagList = q.tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    if (tagList.length) filter.tags = { $in: tagList };
  }
  if (q.fileFormat) {
    filter.fileFormat = q.fileFormat.toUpperCase();
  }
  if (q.availability) {
    filter.availability = q.availability;
  }
  if (q.documentType) {
    filter.documentType = q.documentType;
  }

  return filter;
}

function buildSort(sort) {
  switch (sort) {
    case "mostViewed":
      return { views: -1 };
    case "oldest":
      return { createdAt: 1 };
    case "az":
      return { title: 1 };
    default:
      return { createdAt: -1 };
  }
}

// ─── User routes ──────────────────────────────────────────────────────────────

exports.listItems = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const filter = buildQuery(req.query);
    const sort = buildSort(req.query.sort);

    const [items, total] = await Promise.all([
      LibraryItem.find(filter)
        .sort(sort)
        .skip((page - 1) * ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE)
        .lean(),
      LibraryItem.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

    const [categories, formats] = await Promise.all([
      LibraryItem.distinct("category"),
      LibraryItem.distinct("fileFormat"),
    ]);

    res.render("library", {
      items,
      total,
      page,
      totalPages,
      categories: categories.filter(Boolean).sort(),
      formats: formats.filter(Boolean).sort(),
      query: req.query,
    });
  } catch (err) {
    console.error("Library listItems error:", err);
    res.status(500).send("Failed to load library");
  }
};

exports.viewItem = async (req, res) => {
  try {
    const item = await LibraryItem.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    ).lean();

    if (!item) return res.status(404).send("Item not found");

    const related = await LibraryItem.find({
      category: item.category,
      _id: { $ne: item._id },
    })
      .limit(4)
      .lean();

    res.render("libraryItem", { item, related });
  } catch (err) {
    console.error("Library viewItem error:", err);
    res.status(500).send("Failed to load item");
  }
};

// ─── Admin routes ─────────────────────────────────────────────────────────────

exports.adminList = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const ADMIN_PER_PAGE = 15;

    const [items, total] = await Promise.all([
      LibraryItem.find()
        .sort({ createdAt: -1 })
        .skip((page - 1) * ADMIN_PER_PAGE)
        .limit(ADMIN_PER_PAGE)
        .lean(),
      LibraryItem.countDocuments(),
    ]);

    res.render("admin/library/index", {
      items,
      total,
      page,
      totalPages: Math.ceil(total / ADMIN_PER_PAGE),
    });
  } catch (err) {
    console.error("Admin library list error:", err);
    res.status(500).send("Failed to load admin library");
  }
};

exports.adminAddForm = (req, res) => {
  res.render("admin/library/add", { error: null, values: {} });
};

exports.adminAdd = async (req, res) => {
  try {
    const {
      title,
      author,
      description,
      category,
      tags,
      publicationYear,
      language,
      documentType,
      fileFormat,
      availability,
      isDownloadable,
    } = req.body;

    if (!title || !title.trim()) {
      return res.render("admin/library/add", {
        error: "Title is required",
        values: req.body,
      });
    }

    const tagArray = tags
      ? tags.split(",").map((t) => t.trim()).filter(Boolean)
      : [];

    const fileUrl = req.file ? "/uploads/" + req.file.filename : req.body.fileUrl || "";

    await LibraryItem.create({
      title: title.trim(),
      author: author?.trim() || "",
      description: description?.trim() || "",
      category: category?.trim() || "General",
      tags: tagArray,
      publicationYear: publicationYear ? parseInt(publicationYear) : undefined,
      language: language?.trim() || "English",
      documentType: documentType || "blog",
      fileUrl,
      fileFormat: fileFormat || "",
      availability: availability || "full",
      isDownloadable: isDownloadable === "on" || isDownloadable === "true",
    });

    res.redirect("/admin/library");
  } catch (err) {
    console.error("Admin library add error:", err);
    res.render("admin/library/add", {
      error: err.message || "Failed to add item",
      values: req.body,
    });
  }
};

exports.adminEditForm = async (req, res) => {
  try {
    const item = await LibraryItem.findById(req.params.id).lean();
    if (!item) return res.status(404).send("Item not found");
    res.render("admin/library/edit", { item, error: null });
  } catch (err) {
    console.error("Admin library edit form error:", err);
    res.status(500).send("Failed to load edit form");
  }
};

exports.adminEdit = async (req, res) => {
  try {
    const {
      title,
      author,
      description,
      category,
      tags,
      publicationYear,
      language,
      documentType,
      fileFormat,
      availability,
      isDownloadable,
      existingFileUrl,
    } = req.body;

    if (!title || !title.trim()) {
      const item = await LibraryItem.findById(req.params.id).lean();
      return res.render("admin/library/edit", {
        item,
        error: "Title is required",
      });
    }

    const tagArray = tags
      ? tags.split(",").map((t) => t.trim()).filter(Boolean)
      : [];

    const fileUrl = req.file
      ? "/uploads/" + req.file.filename
      : existingFileUrl || "";

    await LibraryItem.findByIdAndUpdate(req.params.id, {
      title: title.trim(),
      author: author?.trim() || "",
      description: description?.trim() || "",
      category: category?.trim() || "General",
      tags: tagArray,
      publicationYear: publicationYear ? parseInt(publicationYear) : undefined,
      language: language?.trim() || "English",
      documentType: documentType || "blog",
      fileUrl,
      fileFormat: fileFormat || "",
      availability: availability || "full",
      isDownloadable: isDownloadable === "on" || isDownloadable === "true",
    });

    res.redirect("/admin/library");
  } catch (err) {
    console.error("Admin library edit error:", err);
    const item = await LibraryItem.findById(req.params.id).lean();
    res.render("admin/library/edit", {
      item,
      error: err.message || "Failed to update item",
    });
  }
};

exports.adminDelete = async (req, res) => {
  try {
    await LibraryItem.findByIdAndDelete(req.params.id);
    res.redirect("/admin/library");
  } catch (err) {
    console.error("Admin library delete error:", err);
    res.status(500).send("Failed to delete item");
  }
};

// ─── File serving (view only — never exposes raw file URL) ───────────────────

exports.serveFile = async (req, res) => {
  try {
    const item = await LibraryItem.findById(req.params.id).lean();
    if (!item) return res.status(404).send("Not found");
    if (item.availability === "restricted") return res.status(403).send("Restricted");
    if (!item.fileUrl) return res.status(404).send("No file attached");

    const filePath = path.join(__dirname, "../public", item.fileUrl);
    if (!fs.existsSync(filePath)) return res.status(404).send("File not found on server");

    // Always inline — never trigger browser download from viewer
    res.setHeader("Content-Disposition", "inline");
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Cache-Control", "no-store");

    fs.createReadStream(filePath).pipe(res);
  } catch (err) {
    console.error("serveFile error:", err);
    res.status(500).send("Failed to serve file");
  }
};

// ─── Download (only if isDownloadable = true) ─────────────────────────────────

exports.downloadItem = async (req, res) => {
  try {
    const item = await LibraryItem.findById(req.params.id).lean();
    if (!item) return res.status(404).send("Item not found");
    if (!item.isDownloadable) return res.status(403).send("Download not permitted for this item");
    if (!item.fileUrl) return res.status(404).send("No file attached");

    const filePath = path.join(__dirname, "../public", item.fileUrl);
    if (!fs.existsSync(filePath)) return res.status(404).send("File not found on server");

    await LibraryItem.findByIdAndUpdate(req.params.id, { $inc: { downloads: 1 } });

    res.setHeader("Content-Disposition", `attachment; filename="${path.basename(filePath)}"`);
    res.setHeader("Content-Type", "application/pdf");

    fs.createReadStream(filePath).pipe(res);
  } catch (err) {
    console.error("Download error:", err);
    res.status(500).send("Failed to process download");
  }
};
