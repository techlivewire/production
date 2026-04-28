const mongoose = require("mongoose");

const libraryItemSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      index: true,
    },
    author: {
      type: String,
      trim: true,
      default: "",
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    category: {
      type: String,
      trim: true,
      index: true,
      default: "General",
    },
    tags: {
      type: [String],
      index: true,
      default: [],
    },
    publicationYear: {
      type: Number,
      min: 1900,
      max: new Date().getFullYear() + 1,
    },
    language: {
      type: String,
      trim: true,
      default: "English",
    },
    documentType: {
      type: String,
      enum: ["book", "journal", "blog", "report"],
      default: "blog",
    },
    fileUrl: {
      type: String,
      default: "",
    },
    fileFormat: {
      type: String,
      enum: ["PDF", "EPUB", "DOC", ""],
      default: "",
    },
    availability: {
      type: String,
      enum: ["full", "preview", "restricted"],
      default: "full",
    },
    isDownloadable: {
      type: Boolean,
      default: false,
    },
    views: {
      type: Number,
      default: 0,
    },
    downloads: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Text index for full-text search on title
libraryItemSchema.index({ title: "text", description: "text" });
// Compound index for common filter combos
libraryItemSchema.index({ category: 1, createdAt: -1 });
libraryItemSchema.index({ tags: 1, createdAt: -1 });

const LibraryItem = mongoose.model("LibraryItem", libraryItemSchema);

module.exports = LibraryItem;
