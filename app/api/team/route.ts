import { NextRequest, NextResponse } from "next/server";

import { connectDB } from "../../../lib/db";
import { getUserFromRequest } from "../../../lib/rbac";
import Team from "../../../models/Team";

function isNextResponse(value: unknown): value is NextResponse {
  return value instanceof NextResponse;
}

export const runtime = "nodejs";

// GET /api/team (public)
export async function GET() {
  try {
    await connectDB();
    const members = await Team.find({}).sort({ createdAt: -1 }).lean();
    return NextResponse.json({ success: true, data: members }, { status: 200 });
  } catch {
    return NextResponse.json({ success: false, message: "Failed to fetch team" }, { status: 500 });
  }
}

// POST /api/team (authenticated users)
export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const body = (await req.json()) as {
      name?: unknown;
      role?: unknown;
      image?: unknown;
      bio?: unknown;
      category?: unknown;
    };

    const name = typeof body?.name === "string" ? body.name.trim() : "";
    const role = typeof body?.role === "string" ? body.role.trim() : "";
    const image = typeof body?.image === "string" ? body.image.trim() : "";
    const bio = typeof body?.bio === "string" ? body.bio.trim() : "";
    const category = typeof body?.category === "string" ? body.category.trim() : "";

    if (!name || !role || !image || !bio || !category) {
      return NextResponse.json(
        { success: false, message: "name, role, image, bio, and category are required" },
        { status: 400 },
      );
    }

    await connectDB();

    const created = await Team.create({ name, role, image, bio, category });
    return NextResponse.json({ success: true, data: created.toObject() }, { status: 201 });
  } catch {
    return NextResponse.json(
      { success: false, message: "Failed to create team member" },
      { status: 500 },
    );
  }
}

// PUT /api/team (authenticated users)
export async function PUT(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const body = (await req.json()) as {
      id?: unknown;
      name?: unknown;
      role?: unknown;
      image?: unknown;
      bio?: unknown;
      category?: unknown;
    };

    const id = typeof body?.id === "string" ? body.id.trim() : "";
    if (!id) {
      return NextResponse.json({ success: false, message: "id is required" }, { status: 400 });
    }

    const updates: {
      name?: string;
      role?: string;
      image?: string;
      bio?: string;
      category?: string;
    } = {};

    if (typeof body?.name === "string") updates.name = body.name.trim();
    if (typeof body?.role === "string") updates.role = body.role.trim();
    if (typeof body?.image === "string") updates.image = body.image.trim();
    if (typeof body?.bio === "string") updates.bio = body.bio.trim();
    if (typeof body?.category === "string") updates.category = body.category.trim();

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { success: false, message: "No valid fields provided for update" },
        { status: 400 },
      );
    }

    await connectDB();

    const updated = await Team.findByIdAndUpdate(id, updates, { new: true }).lean();
    if (!updated) {
      return NextResponse.json(
        { success: false, message: "Team member not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, data: updated }, { status: 200 });
  } catch {
    return NextResponse.json(
      { success: false, message: "Failed to update team member" },
      { status: 500 },
    );
  }
}

// DELETE /api/team (authenticated users)
export async function DELETE(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const body = (await req.json()) as { id?: unknown };
    const id = typeof body?.id === "string" ? body.id.trim() : "";

    if (!id) {
      return NextResponse.json({ success: false, message: "id is required" }, { status: 400 });
    }

    await connectDB();

    const result = await Team.findByIdAndDelete(id);
    if (!result) {
      return NextResponse.json(
        { success: false, message: "Team member not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, message: "Team member deleted" }, { status: 200 });
  } catch {
    return NextResponse.json(
      { success: false, message: "Failed to delete team member" },
      { status: 500 },
    );
  }
}
