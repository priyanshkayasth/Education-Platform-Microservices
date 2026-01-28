import mongoose from "mongoose";

const connectDB = async (mongoUri: string): Promise<void> => {
  try {
    await mongoose.connect(mongoUri);
    console.log("Auth DB connected");
  } catch (error) {
    if (error instanceof Error) {
      console.error("Mongo connection error:", error.message);
    } else {
      console.error("Mongo connection error:", error);
    }
    process.exit(1);
  }
};

export default connectDB;
