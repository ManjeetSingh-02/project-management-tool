import mongoose from "mongoose";

// function to connect to the database
export async function connectToDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected with DB");
  } catch (error) {
    console.error("Connection with DB failed, err -> ", error);
    process.exit(1);
  }
}
