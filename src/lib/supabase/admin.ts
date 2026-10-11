import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://oorovtqwyfrfjfwuufyi.supabase.co";
const serviceRoleKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9vcm92dHF3eWZyZmpmd3V1ZnlpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4OTMwMzU4NiwiZXhwIjoyMTA0ODc5NTg2fQ.AAjyIcAYAJrix9KgTGd__SWZqWzS7Ew4iSsDxXz7pvc";

export const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});
