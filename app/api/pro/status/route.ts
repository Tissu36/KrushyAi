import { NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/supabase-server";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";

export async function GET(req: Request) {
  const user = await getUserFromRequest(req);
  if (!user) return NextResponse.json({ authenticated: false, pro: false }, { status: 401 });

  const db = getSupabaseAdminClient();
  if (!db) return NextResponse.json({ authenticated: true, pro: false, configured: false });

  const { data } = await db.rpc("is_pro_user", { p_user_id: user.id });
  return NextResponse.json({ authenticated: true, pro: Boolean(data), configured: true });
}
