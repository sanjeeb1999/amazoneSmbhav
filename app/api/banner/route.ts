import { NextRequest, NextResponse } from "next/server";

import { connectDB } from "../../../lib/db";
import { getUserFromRequest } from "../../../lib/rbac";
import Banner from "../../../models/Banner";

export const runtime = "nodejs";

// GET /api/banner (public)
export async function GET() {
  try {
    await connectDB();
    const banners = await Banner.find({}).sort({ createdAt: -1 }).lean();
    return NextResponse.json({ success: true, data: banners }, { status: 200 });
  } catch {
    return NextResponse.json(
      { success: false, message: "Failed to fetch banners" },
      { status: 500 },
    );
  }
}

// POST /api/banner (authenticated users)
export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const body = (await req.json()) as {
      title?: unknown;
      subtitle?: unknown;
      description?: unknown;
      image?: unknown;
      ctaLabel?: unknown;
      ctaTo?: unknown;
    };

    const title = typeof body?.title === "string" ? body.title.trim() : "";
    const subtitle = typeof body?.subtitle === "string" ? body.subtitle.trim() : "";
    const description = typeof body?.description === "string" ? body.description.trim() : "";
    const image = typeof body?.image === "string" ? body.image.trim() : "";
    const ctaLabel = typeof body?.ctaLabel === "string" ? body.ctaLabel.trim() : "";
    const ctaTo = typeof body?.ctaTo === "string" ? body.ctaTo.trim() : "";

    if (!title || !subtitle || !description || !image || !ctaLabel || !ctaTo) {
      return NextResponse.json(
        {
          success: false,
          message: "title, subtitle, description, image, ctaLabel, and ctaTo are required",
        },
        { status: 400 },
      );
    }

    await connectDB();

    const created = await Banner.create({ title, subtitle, description, image, ctaLabel, ctaTo });

    return NextResponse.json({ success: true, data: created.toObject() }, { status: 201 });
  } catch {
    return NextResponse.json(
      { success: false, message: "Failed to create banner" },
      { status: 500 },
    );
  }
}

// PUT /api/banner (authenticated users)
export async function PUT(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const body = (await req.json()) as {
      id?: unknown;
      title?: unknown;
      subtitle?: unknown;
      description?: unknown;
      image?: unknown;
      ctaLabel?: unknown;
      ctaTo?: unknown;
    };

    const id = typeof body?.id === "string" ? body.id.trim() : "";
    if (!id) {
      return NextResponse.json({ success: false, message: "id is required" }, { status: 400 });
    }

    const updates: {
      title?: string;
      subtitle?: string;
      description?: string;
      image?: string;
      ctaLabel?: string;
      ctaTo?: string;
    } = {};
    if (typeof body?.title === "string") updates.title = body.title.trim();
    if (typeof body?.subtitle === "string") updates.subtitle = body.subtitle.trim();
    if (typeof body?.description === "string") updates.description = body.description.trim();
    if (typeof body?.image === "string") updates.image = body.image.trim();
    if (typeof body?.ctaLabel === "string") updates.ctaLabel = body.ctaLabel.trim();
    if (typeof body?.ctaTo === "string") updates.ctaTo = body.ctaTo.trim();

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { success: false, message: "No valid fields provided for update" },
        { status: 400 },
      );
    }

    await connectDB();

    const updated = await Banner.findByIdAndUpdate(id, updates, {
      new: true,
    }).lean();

    if (!updated) {
      return NextResponse.json({ success: false, message: "Banner not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updated }, { status: 200 });
  } catch {
    return NextResponse.json(
      { success: false, message: "Failed to update banner" },
      { status: 500 },
    );
  }
}

// DELETE /api/banner (authenticated users)
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

    const result = await Banner.findByIdAndDelete(id);
    if (!result) {
      return NextResponse.json({ success: false, message: "Banner not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Banner deleted" }, { status: 200 });
  } catch {
    return NextResponse.json(
      { success: false, message: "Failed to delete banner" },
      { status: 500 },
    );
  }
}
