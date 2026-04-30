import { NextRequest, NextResponse } from "next/server";

import { connectDB } from "../../../lib/db";
import { getUserFromRequest } from "../../../lib/rbac";
import Portfolio from "../../../models/Portfolio";

function isNextResponse(value: unknown): value is NextResponse {
  return value instanceof NextResponse;
}

export const runtime = "nodejs";

// GET /api/portfolio (public)
export async function GET() {
  try {
    await connectDB();
    const items = await Portfolio.find({}).sort({ createdAt: -1 }).lean();
    return NextResponse.json({ success: true, data: items }, { status: 200 });
  } catch {
    return NextResponse.json(
      { success: false, message: "Failed to fetch portfolio" },
      { status: 500 },
    );
  }
}

// POST /api/portfolio (authenticated users)
export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const body = (await req.json()) as {
      title?: unknown;
      description?: unknown;
      image?: unknown;
      category?: unknown;
      link?: unknown;
    };

    const title = typeof body?.title === "string" ? body.title.trim() : "";
    const description = typeof body?.description === "string" ? body.description.trim() : "";
    const image = typeof body?.image === "string" ? body.image.trim() : "";
    const category = typeof body?.category === "string" ? body.category.trim() : "";
    const link = typeof body?.link === "string" ? body.link.trim() : "";

    if (!title || !description || !image || !category) {
      return NextResponse.json(
        { success: false, message: "title, description, image, and category are required" },
        { status: 400 },
      );
    }

    await connectDB();

    const created = await Portfolio.create({
      title,
      description,
      image,
      category,
      link,
    });

    return NextResponse.json({ success: true, data: created.toObject() }, { status: 201 });
  } catch {
    return NextResponse.json(
      { success: false, message: "Failed to create portfolio item" },
      { status: 500 },
    );
  }
}

// PUT /api/portfolio (authenticated users)
export async function PUT(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const body = (await req.json()) as {
      id?: unknown;
      title?: unknown;
      description?: unknown;
      image?: unknown;
      category?: unknown;
      link?: unknown;
    };

    const id = typeof body?.id === "string" ? body.id.trim() : "";
    if (!id) {
      return NextResponse.json({ success: false, message: "id is required" }, { status: 400 });
    }

    const updates: {
      title?: string;
      description?: string;
      image?: string;
      category?: string;
      link?: string;
    } = {};

    if (typeof body?.title === "string") updates.title = body.title.trim();
    if (typeof body?.description === "string") updates.description = body.description.trim();
    if (typeof body?.image === "string") updates.image = body.image.trim();
    if (typeof body?.category === "string") updates.category = body.category.trim();
    if (typeof body?.link === "string") updates.link = body.link.trim();

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { success: false, message: "No valid fields provided for update" },
        { status: 400 },
      );
    }

    await connectDB();

    const updated = await Portfolio.findByIdAndUpdate(id, updates, {
      new: true,
    }).lean();

    if (!updated) {
      return NextResponse.json(
        { success: false, message: "Portfolio item not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, data: updated }, { status: 200 });
  } catch {
    return NextResponse.json(
      { success: false, message: "Failed to update portfolio item" },
      { status: 500 },
    );
  }
}

// DELETE /api/portfolio (authenticated users)
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

    const result = await Portfolio.findByIdAndDelete(id);
    if (!result) {
      return NextResponse.json(
        { success: false, message: "Portfolio item not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, message: "Portfolio item deleted" }, { status: 200 });
  } catch {
    return NextResponse.json(
      { success: false, message: "Failed to delete portfolio item" },
      { status: 500 },
    );
  }
}
