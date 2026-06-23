import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/**
 * Verifies that the request has a valid Supabase auth session.
 * Returns the user object if authenticated, or a 401 response.
 *
 * Usage in API routes:
 *   const { user, error } = await requireAuth(request);
 *   if (error) return error;
 */
export async function requireAuth(request: Request) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

  if (!supabaseUrl || !supabaseKey) {
    return {
      user: null,
      error: NextResponse.json(
        { error: "Supabase not configured" },
        { status: 500 }
      ),
    };
  }

  // Get the access token from the Authorization header
  const authHeader = request.headers.get("Authorization") || "";
  const token = authHeader.replace("Bearer ", "");

  if (!token) {
    return {
      user: null,
      error: NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      ),
    };
  }

  // Verify the token server-side
  const supabase = createClient(supabaseUrl, supabaseKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data.user) {
    return {
      user: null,
      error: NextResponse.json(
        { error: "Invalid or expired session" },
        { status: 401 }
      ),
    };
  }

  return { user: data.user, error: null };
}
