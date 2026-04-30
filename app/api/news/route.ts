import { NextRequest, NextResponse } from "next/server";

import { connectDB } from "../../../lib/db";
import { getUserFromRequest } from "../../../lib/rbac";
import News from "../../../models/News";

function isNextResponse(value: unknown): value is NextResponse {
  return value instanceof NextResponse;
}

export const runtime = "nodejs";

// GET /api/news (public)
export async function GET() {
  try {
    await connectDB();
    const items = await News.find({}).sort({ date: -1 }).lean();
    return NextResponse.json({ success: true, data: items }, { status: 200 });
  } catch {
    return NextResponse.json({ success: false, message: "Failed to fetch news" }, { status: 500 });
  }
}

// POST /api/news (authenticated users)
export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const body = (await req.json()) as {
      title?: unknown;
      content?: unknown;
      image?: unknown;
      date?: unknown;
      externalLink?: unknown;
    };

    const title = typeof body?.title === "string" ? body.title.trim() : "";
    const content = typeof body?.content === "string" ? body.content.trim() : "";
    const image = typeof body?.image === "string" ? body.image.trim() : "";
    const externalLink = typeof body?.externalLink === "string" ? body.externalLink.trim() : "";

    const dateValue =
      typeof body?.date === "string" || typeof body?.date === "number" ? new Date(body.date) : null;

    if (!title || !content || !image || !dateValue || Number.isNaN(dateValue.getTime())) {
      return NextResponse.json(
        { success: false, message: "title, content, image, and date are required" },
        { status: 400 },
      );
    }

    await connectDB();

    const created = await News.create({
      title,
      content,
      image,
      date: dateValue,
      externalLink,
    });

    return NextResponse.json({ success: true, data: created.toObject() }, { status: 201 });
  } catch {
    return NextResponse.json(
      { success: false, message: "Failed to create news item" },
      { status: 500 },
    );
  }
}

// PUT /api/news (authenticated users)
export async function PUT(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const body = (await req.json()) as {
      id?: unknown;
      title?: unknown;
      content?: unknown;
      image?: unknown;
      date?: unknown;
      externalLink?: unknown;
    };

    const id = typeof body?.id === "string" ? body.id.trim() : "";
    if (!id) {
      return NextResponse.json({ success: false, message: "id is required" }, { status: 400 });
    }

    const updates: {
      title?: string;
      content?: string;
      image?: string;
      date?: Date;
      externalLink?: string;
    } = {};

    if (typeof body?.title === "string") updates.title = body.title.trim();
    if (typeof body?.content === "string") updates.content = body.content.trim();
    if (typeof body?.image === "string") updates.image = body.image.trim();
    if (typeof body?.externalLink === "string") updates.externalLink = body.externalLink.trim();

    if (typeof body?.date === "string" || typeof body?.date === "number") {
      const parsed = new Date(body.date);
      if (!Number.isNaN(parsed.getTime())) updates.date = parsed;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { success: false, message: "No valid fields provided for update" },
        { status: 400 },
      );
    }

    await connectDB();

    const updated = await News.findByIdAndUpdate(id, updates, { new: true }).lean();
    if (!updated) {
      return NextResponse.json({ success: false, message: "News item not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updated }, { status: 200 });
  } catch {
    return NextResponse.json(
      { success: false, message: "Failed to update news item" },
      { status: 500 },
    );
  }
}

// DELETE /api/news (authenticated users)
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

    const result = await News.findByIdAndDelete(id);
    if (!result) {
      return NextResponse.json({ success: false, message: "News item not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "News item deleted" }, { status: 200 });
  } catch {
    return NextResponse.json(
      { success: false, message: "Failed to delete news item" },
      { status: 500 },
    );
  }
}
