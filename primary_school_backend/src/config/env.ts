import dotenv from "dotenv";
import { type dotEnv } from "./types.js";
dotenv.config();
const DotEnvFile: dotEnv = {
  DEVPort: String(process.env.PORT),
  DatabaseConnectionString: String(process.env.MONGODB_URI),
  clientOrigin: String(process.env.CLIENT_ORIGIN),
};
export default DotEnvFile;
