import dotenv from "dotenv";
import { type dotEnv } from "./types.js";
import path from "path";
dotenv.config({ path: path.join(process.cwd(), ".env") });
console.log(`The working folder${process.cwd()}.env`);
const DotEnvFile: dotEnv = {
  DEVPort: String(process.env.PORT),
  DatabaseConnectionString: String(process.env.MONGODB_URI),
  clientOrigin: String(process.env.CLIENT_ORIGIN),
  SupabaseUrl: String(process.env.SUPABASE_URL),
  SupabaseRoleKey: String(process.env.SUPABASE_SERVICE_ROLE_KEY),
  SupabaseBucket: String(process.env.SUPABASE_BUCKET),
};
export default DotEnvFile;
