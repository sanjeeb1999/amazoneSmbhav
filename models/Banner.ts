import mongoose, { type InferSchemaType, type HydratedDocument } from "mongoose";

const bannerSchema = new mongoose.Schema(
  {
    title: { type: String },
    subtitle: { type: String },
    image: { type: String },
    ctaLabel: { type: String },
    ctaTo: { type: String },
  },
  { timestamps: true },
);

export type Banner = InferSchemaType<typeof bannerSchema>;
export type BannerDocument = HydratedDocument<Banner>;

export default mongoose.models.Banner || mongoose.model<BannerDocument>("Banner", bannerSchema);
