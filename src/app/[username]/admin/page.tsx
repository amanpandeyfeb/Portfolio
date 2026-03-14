import AdminClient from "../AdminClient";
import { normalizeUsername } from "@/lib/username";

export const dynamic = "force-dynamic";

export default async function UsernameAdminPage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const resolvedParams = await params;
  return <AdminClient username={normalizeUsername(resolvedParams.username)} />;
}
