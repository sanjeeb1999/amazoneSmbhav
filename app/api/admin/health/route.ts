import { NextRequest, NextResponse } from "next/server";

import { requireRole } from "../../../../lib/rbac";
import { type AuthTokenPayload } from "../../../../lib/auth";

function isNextResponse(value: AuthTokenPayload | NextResponse): value is NextResponse {
  return value instanceof NextResponse;
}

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const result = await requireRole(req, "admin");
  if (isNextResponse(result)) return result;

  return NextResponse.json({
    success: true,
    message: "Admin access granted",
  });
}
