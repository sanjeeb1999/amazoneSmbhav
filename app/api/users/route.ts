import bcrypt from "bcrypt";
import { NextRequest, NextResponse } from "next/server";

import { connectDB } from "../../../lib/db";
import { sendWelcomeEmail } from "../../../lib/email";
import { requireRole } from "../../../lib/rbac";
import User from "../../../models/User";

function isNextResponse(value: unknown): value is NextResponse {
  return value instanceof NextResponse;
}

export const runtime = "nodejs";

// GET /api/users (admin only)
export async function GET(req: NextRequest) {
  try {
    const authResult = await requireRole(req, "admin");
    if (isNextResponse(authResult)) return authResult;

    await connectDB();

    const users = await User.find({})
      .select("_id email role mfaEnabled")
      .sort({ createdAt: -1 })
      .lean();
    return NextResponse.json({ success: true, data: users }, { status: 200 });
  } catch {
    return NextResponse.json({ success: false, message: "Failed to fetch users" }, { status: 500 });
  }
}

// POST /api/users (admin only)
export async function POST(req: NextRequest) {
  try {
    const authResult = await requireRole(req, "admin");
    if (isNextResponse(authResult)) return authResult;

    const body = (await req.json()) as {
      email?: unknown;
      password?: unknown;
      role?: unknown;
    };

    const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body?.password === "string" ? body.password : "";
    const role = body?.role === "admin" || body?.role === "user" ? body.role : null;

    if (!email || !password || !role) {
      return NextResponse.json(
        { success: false, message: "email, password, and role are required" },
        { status: 400 },
      );
    }

    await connectDB();

    const existing = await User.findOne({ email }).lean();
    if (existing) {
      return NextResponse.json({ success: false, message: "User already exists" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const created = await User.create({
      email,
      password: hashedPassword,
      role,
      mfaEnabled: true,
      mfaSecret: null,
    });

    try {
      await sendWelcomeEmail(email, password);
    } catch {
      await User.findByIdAndDelete(created._id);
      return NextResponse.json(
        { success: false, message: "Failed to send welcome email. User was not created." },
        { status: 500 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          _id: String(created._id),
          email: created.email,
          role: created.role,
          mfaEnabled: created.mfaEnabled,
        },
      },
      { status: 201 },
    );
  } catch {
    return NextResponse.json({ success: false, message: "Failed to create user" }, { status: 500 });
  }
}

// PUT /api/users (admin only)
export async function PUT(req: NextRequest) {
  try {
    const authResult = await requireRole(req, "admin");
    if (isNextResponse(authResult)) return authResult;

    const body = (await req.json()) as {
      id?: unknown;
      email?: unknown;
      password?: unknown;
      role?: unknown;
    };

    const id = typeof body?.id === "string" ? body.id.trim() : "";
    const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body?.password === "string" ? body.password : "";
    const role = body?.role === "admin" || body?.role === "user" ? body.role : null;

    if (!id || !email || !role) {
      return NextResponse.json({ success: false, message: "id, email, and role are required" }, { status: 400 });
    }

    await connectDB();

    const targetUser = await User.findById(id);
    if (!targetUser) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }

    if (targetUser.role === "admin") {
      return NextResponse.json({ success: false, message: "Admin users cannot be edited" }, { status: 403 });
    }

    const duplicate = await User.findOne({ email, _id: { $ne: id } }).lean();
    if (duplicate) {
      return NextResponse.json({ success: false, message: "Email already in use" }, { status: 400 });
    }

    targetUser.email = email;
    targetUser.role = role;

    if (password.trim()) {
      targetUser.password = await bcrypt.hash(password, 10);
    }

    await targetUser.save();

    return NextResponse.json(
      {
        success: true,
        data: {
          _id: String(targetUser._id),
          email: targetUser.email,
          role: targetUser.role,
          mfaEnabled: targetUser.mfaEnabled,
        },
      },
      { status: 200 },
    );
  } catch {
    return NextResponse.json({ success: false, message: "Failed to update user" }, { status: 500 });
  }
}

// DELETE /api/users (admin only)
export async function DELETE(req: NextRequest) {
  try {
    const authResult = await requireRole(req, "admin");
    if (isNextResponse(authResult)) return authResult;

    const body = (await req.json()) as { id?: unknown };
    const id = typeof body?.id === "string" ? body.id.trim() : "";

    if (!id) {
      return NextResponse.json({ success: false, message: "id is required" }, { status: 400 });
    }

    await connectDB();

    const targetUser = await User.findById(id);
    if (!targetUser) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }

    if (targetUser.role === "admin") {
      return NextResponse.json({ success: false, message: "Admin users cannot be deleted" }, { status: 403 });
    }

    await User.findByIdAndDelete(id);

    return NextResponse.json({ success: true, message: "User deleted successfully" }, { status: 200 });
  } catch {
    return NextResponse.json({ success: false, message: "Failed to delete user" }, { status: 500 });
  }
}
