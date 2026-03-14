import AdminClient from "../AdminClient";
import { normalizeUsername } from "@/lib/username";

export const dynamic = "force-dynamic";

export default function UsernameAdminPage({
  params,
}: {
  params: { username: string };
}) {
  return <AdminClient username={normalizeUsername(params.username)} />;
}
