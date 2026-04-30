import { NextRequest, NextResponse } from "next/server";

import { sendContactEmail } from "../../../lib/email";

const CONTACT_RECEIVER_EMAIL = "sanjeebks@mirakitech.com";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      firstName?: unknown;
      lastName?: unknown;
      organization?: unknown;
      email?: unknown;
      phone?: unknown;
      message?: unknown;
    };

    const firstName = typeof body.firstName === "string" ? body.firstName.trim() : "";
    const lastName = typeof body.lastName === "string" ? body.lastName.trim() : "";
    const organization = typeof body.organization === "string" ? body.organization.trim() : "";
    const email = typeof body.email === "string" ? body.email.trim() : "";
    const phone = typeof body.phone === "string" ? body.phone.trim() : "";
    const message = typeof body.message === "string" ? body.message.trim() : "";

    if (!firstName || !organization || !email || !phone) {
      return NextResponse.json(
        { success: false, message: "firstName, organization, email, and phone are required" },
        { status: 400 },
      );
    }

    const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!validEmail) {
      return NextResponse.json({ success: false, message: "Invalid email address" }, { status: 400 });
    }

    await sendContactEmail({
      to: CONTACT_RECEIVER_EMAIL,
      firstName,
      lastName,
      organization,
      email,
      phone,
      message,
    });

    return NextResponse.json(
      { success: true, message: "Message sent successfully" },
      { status: 200 },
    );
  } catch {
    return NextResponse.json({ success: false, message: "Failed to send message" }, { status: 500 });
  }
}
