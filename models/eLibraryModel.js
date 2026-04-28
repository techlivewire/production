const mongoose = require("mongoose");

const eLibraryItemSchema = new mongoose.Schema(
  {
    // ── Core (both types) ────────────────────────────────────────────────────
    libraryType: {
      type: String,
      enum: ["spiritual", "basic"],
      required: true,
      index: true,
    },
    title: { type: String, required: true, trim: true },
    author: { type: String, trim: true, default: "" },
    description: { type: String, trim: true, default: "" },
    language: { type: String, trim: true, default: "English" },
    publicationYear: { type: Number },
    tags: { type: [String], index: true, default: [] },
    fileUrl: { type: String, default: "" },
    fileFormat: { type: String, enum: ["PDF", "EPUB", "DOC", ""], default: "" },
    availability: {
      type: String,
      enum: ["full", "preview", "restricted"],
      default: "full",
    },
    isDownloadable: { type: Boolean, default: false },
    views: { type: Number, default: 0 },
    downloads: { type: Number, default: 0 },
    isFeatured: { type: Boolean, default: false },
    readingLevel: {
      type: String,
      enum: ["beginner", "intermediate", "advanced", ""],
      default: "",
    },

    // ── Basic / Academic fields ──────────────────────────────────────────────
    basic: {
      category: { type: String, trim: true, default: "" },        // Science, History, etc.
      documentType: {
        type: String,
        enum: ["book", "journal", "thesis", "report", "article", ""],
        default: "",
      },
      keywords: { type: [String], default: [] },
      publisher: { type: String, trim: true, default: "" },
      institution: { type: String, trim: true, default: "" },
      isPeerReviewed: { type: Boolean, default: false },
      course: { type: String, trim: true, default: "" },          // curriculum link
    },

    // ── Spiritual fields ─────────────────────────────────────────────────────
    spiritual: {
      scriptureName: { type: String, trim: true, default: "" },   // Bhagavad Gita, Rigveda
      section: { type: String, trim: true, default: "" },         // Adhyaya / Sukta / Mantra no.
      shloka: { type: String, trim: true, default: "" },          // verse reference
      darshana: {                                                  // Philosophical school
        type: String,
        enum: ["Vedanta", "Samkhya", "Yoga", "Nyaya", "Vaisheshika", "Mimamsa", ""],
        default: "",
      },
      sampradaya: {                                                // Lineage
        type: String,
        enum: ["Vaishnav", "Shaiva", "Shakta", "Smarta", ""],
        default: "",
      },
      commentaryBy: { type: String, trim: true, default: "" },    // Shankaracharya etc.
      practiceType: {                                              // Type of practice
        type: String,
        enum: ["Meditation", "Yoga", "Bhakti", "Karma", "Mantra", "Ritual", ""],
        default: "",
      },
      deity: { type: String, trim: true, default: "" },           // Krishna, Shiva, Durga
      spiritualConcept: {                                          // Dharma, Karma, Moksha
        type: String,
        enum: ["Dharma", "Karma", "Moksha", "Atman", "Brahman", "Maya", ""],
        default: "",
      },
      yuga: {
        type: String,
        enum: ["Satya", "Treta", "Dvapara", "Kali", ""],
        default: "",
      },
      historicalPeriod: {
        type: String,
        enum: ["Vedic", "Epic", "Puranic", "Medieval", "Modern", ""],
        default: "",
      },
      audience: {                                                  // Spiritual depth
        type: String,
        enum: ["Beginner/Seeker", "Practitioner", "Advanced", "Children/Youth", "Scholars", ""],
        default: "",
      },
      lifestyle: {                                                 // Ayurveda, Dinacharya etc.
        type: String,
        enum: ["Ayurveda", "Dinacharya", "Ethics", ""],
        default: "",
      },
      translationType: {
        type: String,
        enum: ["Original Sanskrit", "Translation", "Commentary", "Simplified", "Scholarly", ""],
        default: "",
      },
    },
  },
  { timestamps: true }
);

// Indexes
eLibraryItemSchema.index({ title: "text", description: "text", tags: "text" });
eLibraryItemSchema.index({ libraryType: 1, createdAt: -1 });
eLibraryItemSchema.index({ "basic.category": 1 });
eLibraryItemSchema.index({ "spiritual.scriptureName": 1 });
eLibraryItemSchema.index({ "spiritual.deity": 1 });
eLibraryItemSchema.index({ isFeatured: 1 });

const ELibraryItem = mongoose.model("ELibraryItem", eLibraryItemSchema);

module.exports = ELibraryItem;
