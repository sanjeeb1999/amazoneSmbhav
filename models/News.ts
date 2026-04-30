import mongoose, { type InferSchemaType, type HydratedDocument } from "mongoose";

const newsSchema = new mongoose.Schema(
  {
    title: { type: String },
    content: { type: String },
    image: { type: String },
    date: { type: Date },
    externalLink: { type: String },
  },
  { timestamps: true },
);

export type News = InferSchemaType<typeof newsSchema>;
export type NewsDocument = HydratedDocument<News>;

export default mongoose.models.News || mongoose.model<NewsDocument>("News", newsSchema);
