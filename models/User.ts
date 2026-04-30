import mongoose, { type InferSchemaType, type HydratedDocument } from "mongoose";

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["admin", "user"], default: "user" },
    mfaEnabled: { type: Boolean, default: true },
    mfaSecret: { type: String, default: undefined },
    otp: { type: String, default: undefined },
    otpExpiry: { type: Date, default: undefined },
    otpSentAt: { type: Date, default: undefined },
  },
  { timestamps: true },
);

export type User = InferSchemaType<typeof userSchema>;
export type UserDocument = HydratedDocument<User>;

export default mongoose.models.User || mongoose.model<UserDocument>("User", userSchema);
