import mongoose, { type Mongoose } from "mongoose";

type CachedConnection = {
  conn: Mongoose | null;
  promise: Promise<Mongoose> | null;
};

declare global {
  // Cache the connection across hot reloads in dev.
  var __mongoose: CachedConnection | undefined;
}

const globalWithMongoose = globalThis as typeof globalThis & {
  __mongoose?: CachedConnection;
};

export async function connectDB(): Promise<Mongoose> {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    throw new Error("MONGODB_URI environment variable is not set");
  }

  if (globalWithMongoose.__mongoose?.conn) {
    return globalWithMongoose.__mongoose.conn;
  }

  if (!globalWithMongoose.__mongoose) {
    globalWithMongoose.__mongoose = { conn: null, promise: null };
  }

  if (!globalWithMongoose.__mongoose.promise) {
    globalWithMongoose.__mongoose.promise = mongoose
      .connect(mongoUri)
      .then((mongooseInstance) => mongooseInstance);
  }

  try {
    const conn = await globalWithMongoose.__mongoose.promise;
    globalWithMongoose.__mongoose.conn = conn;
    return conn;
  } catch (err) {
    // Allow retry after a failed connection attempt.
    globalWithMongoose.__mongoose.promise = null;
    throw err;
  }
}
