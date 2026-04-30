import { NextRequest, NextResponse } from "next/server";

import { connectDB } from "../../../lib/db";
import { getUserFromRequest } from "../../../lib/rbac";
import Settings from "../../../models/Settings";

function isNextResponse(value: unknown): value is NextResponse {
  return value instanceof NextResponse;
}

export const runtime = "nodejs";

// GET /api/settings (public)
export async function GET() {
  try {
    await connectDB();
    const settings = await Settings.findOne({}).lean();
    return NextResponse.json({ success: true, data: settings ?? {} }, { status: 200 });
  } catch {
    return NextResponse.json(
      { success: false, message: "Failed to fetch settings" },
      { status: 500 },
    );
  }
}

function parseSettingsInput(input: unknown): {
  siteTitle?: string;
  logo?: string;
  contactEmail?: string;
  socialLinks?: Record<string, unknown>;
} {
  const body = (input ?? {}) as Record<string, unknown>;

  const siteTitle = typeof body.siteTitle === "string" ? body.siteTitle.trim() : "";
  const logo = typeof body.logo === "string" ? body.logo.trim() : "";
  const contactEmail = typeof body.contactEmail === "string" ? body.contactEmail.trim() : "";
  const socialLinks =
    typeof body.socialLinks === "object" && body.socialLinks !== null
      ? (body.socialLinks as Record<string, unknown>)
      : undefined;

  return {
    siteTitle: siteTitle || undefined,
    logo: logo || undefined,
    contactEmail: contactEmail || undefined,
    socialLinks,
  };
}

async function upsertSettings(authReq: NextRequest) {
  const user = await getUserFromRequest(authReq);
  if (!user) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  const body = await authReq.json();
  const parsed = parseSettingsInput(body);

  const hasAnyField = Object.keys(parsed).some((k) => {
    const v = (parsed as Record<string, unknown>)[k];
    return typeof v !== "undefined";
  });

  if (!hasAnyField) {
    return NextResponse.json(
      { success: false, message: "No valid fields provided" },
      { status: 400 },
    );
  }

  await connectDB();

  const existing = await Settings.findOne({});
  if (!existing) {
    const created = await Settings.create(parsed);
    return NextResponse.json({ success: true, data: created.toObject() }, { status: 201 });
  }

  existing.siteTitle = parsed.siteTitle ?? existing.siteTitle;
  existing.logo = parsed.logo ?? existing.logo;
  existing.contactEmail = parsed.contactEmail ?? existing.contactEmail;
  if (typeof parsed.socialLinks !== "undefined") existing.socialLinks = parsed.socialLinks;

  const saved = await existing.save();
  return NextResponse.json({ success: true, data: saved.toObject() }, { status: 200 });
}

// POST /api/settings (authenticated users)
export async function POST(req: NextRequest) {
  try {
    return await upsertSettings(req);
  } catch {
    return NextResponse.json(
      { success: false, message: "Failed to upsert settings" },
      { status: 500 },
    );
  }
}

// PUT /api/settings (authenticated users)
export async function PUT(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = parseSettingsInput(body);

    const hasAnyField = Object.keys(parsed).some((k) => {
      const v = (parsed as Record<string, unknown>)[k];
      return typeof v !== "undefined";
    });

    if (!hasAnyField) {
      return NextResponse.json(
        { success: false, message: "No valid fields provided" },
        { status: 400 },
      );
    }

    await connectDB();

    const existing = await Settings.findOne({});
    if (!existing) {
      return NextResponse.json({ success: false, message: "Settings not found" }, { status: 404 });
    }

    if (typeof parsed.siteTitle !== "undefined") existing.siteTitle = parsed.siteTitle;
    if (typeof parsed.logo !== "undefined") existing.logo = parsed.logo;
    if (typeof parsed.contactEmail !== "undefined") existing.contactEmail = parsed.contactEmail;
    if (typeof parsed.socialLinks !== "undefined") existing.socialLinks = parsed.socialLinks;

    const saved = await existing.save();
    return NextResponse.json({ success: true, data: saved.toObject() }, { status: 200 });
  } catch {
    return NextResponse.json(
      { success: false, message: "Failed to update settings" },
      { status: 500 },
    );
  }
}
