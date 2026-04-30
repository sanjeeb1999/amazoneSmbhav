import { NextResponse, type NextRequest } from "next/server";

import { verifyToken, type AuthTokenPayload } from "./auth";

export async function getUserFromRequest(request: NextRequest): Promise<AuthTokenPayload | null> {
  const token = request.cookies.get("token")?.value;
  if (!token) return null;

  try {
    return verifyToken(token);
  } catch {
    return null;
  }
}

export async function requireRole(
  request: NextRequest,
  role: AuthTokenPayload["role"],
): Promise<AuthTokenPayload | NextResponse> {
  const user = await getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  if (user.role !== role) {
    return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
  }

  return user;
}
