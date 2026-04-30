import mongoose, { type InferSchemaType, type HydratedDocument } from "mongoose";

const settingsSchema = new mongoose.Schema(
  {
    siteTitle: { type: String },
    logo: { type: String },
    contactEmail: { type: String },
    // Keep it flexible for CMS-driven social links.
    socialLinks: { type: Object, default: {} },
  },
  { timestamps: true },
);

export type Settings = InferSchemaType<typeof settingsSchema>;
export type SettingsDocument = HydratedDocument<Settings>;

export default mongoose.models.Settings ||
  mongoose.model<SettingsDocument>("Settings", settingsSchema);
