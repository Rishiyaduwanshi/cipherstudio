import mongoose from "mongoose";
import { config } from "../config/index.js";

const connectDb = async () => {
  try {
    const conn = await mongoose.connect(config.MONGO_URI);
    console.log(
      `Database connected successfully 🥳 to ${
        conn?.connection?.host || config.MONGO_URI.split("@")[1]
      }`,
    );
  } catch (error) {
    console.error("Database connection error 😢", error);
    process.exit(1);
  }
};

connectDb();

export default connectDb;
