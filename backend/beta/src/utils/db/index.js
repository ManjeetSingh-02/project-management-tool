import mongoose from "mongoose";

// function to connect to the database
export async function connectToDB() {
  await mongoose
    .connect(process.env.MONGO_URI)
    .then(() => console.log("Connected with DB"))
    .catch(error => {
      console.log("Error connecting to DB", error);
      process.exit(1);
    });
}
