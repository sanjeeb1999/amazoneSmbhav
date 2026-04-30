import mongoose, { type InferSchemaType, type HydratedDocument } from "mongoose";

const portfolioSchema = new mongoose.Schema(
  {
    title: { type: String },
    description: { type: String },
    highlight: { type: String },
    image: { type: String },
    category: { type: String },
    link: { type: String },
  },
  { timestamps: true },
);

export type Portfolio = InferSchemaType<typeof portfolioSchema>;
export type PortfolioDocument = HydratedDocument<Portfolio>;

export default mongoose.models.Portfolio ||
  mongoose.model<PortfolioDocument>("Portfolio", portfolioSchema);
