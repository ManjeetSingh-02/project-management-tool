import dotenv from 'dotenv';
import app from './app.js';
import { connectToDB } from './utils/db/index.js';

dotenv.config({ path: './.env' });
const PORT = process.env.PORT || 5000;

connectToDB().then(() => app.listen(PORT, () => console.log(`Running on port ${PORT}`)));
