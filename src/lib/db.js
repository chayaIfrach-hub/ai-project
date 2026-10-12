import mongoose from "mongoose";

export default async function connectDB(params) {
  try {
    const uri = process.env.MONGO_URI;

    if (!uri) {
      throw new Error("MONGO_URI is not set");
    }
    const connection = await mongoose.connect(uri);
    return connection;
  } catch (error) {
    console.error("Failed to connect to mongodb:", error);
    throw error;
  }
}
