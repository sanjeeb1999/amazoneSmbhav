import { NextRequest, NextResponse } from "next/server";

import { verifyToken } from "../../../../lib/auth";
import { connectDB } from "../../../../lib/db";
import User from "../../../../models/User";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    let payload: ReturnType<typeof verifyToken>;
    try {
      payload = verifyToken(token);
    } catch {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const user = await User.findById(payload.userId).select("_id email role").lean();

    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          _id: String(user._id),
          email: user.email,
          role: user.role,
        },
      },
      { status: 200 },
    );
  } catch {
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
