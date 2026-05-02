



// this is for railways


const mongoose = require("mongoose");

const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://eLibrarySystem:eLibrarySystem@cluster0.9mxtrby.mongodb.net/journaldb?retryWrites=true&w=majority&appName=Cluster0";
console.log("MONGO_URI exists:", !!process.env.MONGO_URI);


if (!MONGO_URI) {
  throw new Error("MONGO_URI is not defined in environment variables");
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDb() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = await mongoose.connect(MONGO_URI, {
      bufferCommands: false,
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (err) {
    cached.promise = null; // 🔥 important fix
    throw err;
  }

  return cached.conn;
}

module.exports = connectDb;