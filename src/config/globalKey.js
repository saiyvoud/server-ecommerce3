import dotenv from "dotenv";
dotenv.config();
const PORT = process.env.PORT;
const SECREAT_KEY = process.env.SECREAT_KEY;
const SECREAT_KEY_REFRESH = process.env.SECREAT_KEY_REFRESH
export {
    PORT, SECREAT_KEY, SECREAT_KEY_REFRESH,
}