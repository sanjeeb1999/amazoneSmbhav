import { NextRequest, NextResponse } from "next/server";

import { signToken } from "../../../../lib/auth";
import { connectDB } from "../../../../lib/db";
import User from "../../../../models/User";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { email?: unknown; otp?: unknown };

    const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
    const otp = typeof body?.otp === "string" ? body.otp.trim() : "";

    if (!email || !otp) {
      return NextResponse.json({ success: false, message: "Email and OTP are required" }, { status: 400 });
    }

    await connectDB();

    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ success: false, message: "Invalid credentials" }, { status: 401 });
    }

    if (!user.otp || !user.otpExpiry) {
      return NextResponse.json({ success: false, message: "OTP not requested" }, { status: 401 });
    }

    const isExpired = user.otpExpiry.getTime() < Date.now();
    if (user.otp !== otp || isExpired) {
      return NextResponse.json({ success: false, message: "Invalid or expired OTP" }, { status: 401 });
    }

    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    const jwtToken = signToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role as "admin" | "user",
    });

    const res = NextResponse.json({
      success: true,
      message: "Login successful",
    });

    res.cookies.set("token", jwtToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return res;
  } catch {
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
