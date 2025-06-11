import dotenv from "dotenv";
import app from "./app.js";
import { connectToDB } from "./utils/db/index.js";

//dotenv file path and PORT setup
dotenv.config({ path: "./.env" });
const PORT = process.env.PORT || 5000;

// Connect to the database and start the server
connectToDB().then(() => app.listen(PORT, () => console.log(`Running on port ${PORT}`)));
