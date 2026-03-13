import { createSupabaseServerClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import AdminClient from "./AdminClient";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  if (hasSupabaseEnv()) {
    const supabase = createSupabaseServerClient();
    await supabase.auth.getUser();
  }

  return <AdminClient />;
}
