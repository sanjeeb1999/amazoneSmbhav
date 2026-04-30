import { NextRequest, NextResponse } from "next/server";

import { connectDB } from "../../../../lib/db";
import { sendOtpEmail } from "../../../../lib/email";
import User from "../../../../models/User";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { email?: unknown };
    const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";

    if (!email) {
      return NextResponse.json({ success: false, message: "Email is required" }, { status: 400 });
    }

    await connectDB();

    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }

    const now = Date.now();
    const cooldownMs = 30 * 1000;

    if (user.otpSentAt) {
      const elapsed = now - user.otpSentAt.getTime();
      if (elapsed < cooldownMs) {
        const waitSeconds = Math.ceil((cooldownMs - elapsed) / 1000);
        return NextResponse.json(
          { success: false, message: `Please wait ${waitSeconds}s before requesting a new OTP` },
          { status: 429 },
        );
      }
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000));
    user.otp = otp;
    user.otpExpiry = new Date(now + 5 * 60 * 1000);
    user.otpSentAt = new Date(now);

    await user.save();
    await sendOtpEmail(user.email, otp);

    return NextResponse.json({
      success: true,
      message: "OTP resent successfully",
    });
  } catch {
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
