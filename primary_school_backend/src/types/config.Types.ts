export interface dotEnv {
  DEVPort: string;
  DatabaseConnectionString: string;
  clientOrigin: string;
  SupabaseUrl: string;
  SupabaseRoleKey: string;
  SupabaseBucket: string;
  WAHA_BASE_URL: string;
  WAHA_API: string;
  WAHA_session: string;
  WAHA_SEND_DELAY_MS: number;
  WAHA_SEND_JITTER_MS: number;
}
