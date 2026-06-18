import dotenv from "dotenv";
import { type dotEnv } from "../types/config.Types.js";
import path from "path";
dotenv.config({ path: path.join(process.cwd(), ".env") });
const DotEnvFile: dotEnv = {
  DEVPort: String(process.env.PORT),
  DatabaseConnectionString: String(process.env.MONGODB_URI),
  clientOrigin: String(process.env.CLIENT_ORIGIN),
  SupabaseUrl: String(process.env.SUPABASE_URL?.trim()),
  SupabaseRoleKey: String(process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()),
  SupabaseBucket: String(process.env.SUPABASE_BUCKET?.trim()).trim(),
};
export default DotEnvFile;
