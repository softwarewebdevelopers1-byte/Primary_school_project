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
  SupabaseBucket: String(process.env.SUPABASE_BUCKET?.trim()),
  WAHA_BASE_URL: String(process.env.WAHA_BASE_URL),
  WAHA_API: String(process.env.WAHA_API_KEY),
  WAHA_session: String(process.env.WAHA_SESSION),
  WAHA_SEND_DELAY_MS: Number(process.env.WAHA_SEND_DELAY_MS),
  WAHA_SEND_JITTER_MS: Number(process.env.WAHA_SEND_JITTER_MS),
};
export default DotEnvFile;
