import mongoose, { type InferSchemaType, type HydratedDocument } from "mongoose";

const teamSchema = new mongoose.Schema(
  {
    name: { type: String },
    role: { type: String },
    image: { type: String },
    bio: { type: String },
    category: { type: String },
  },
  { timestamps: true },
);

export type Team = InferSchemaType<typeof teamSchema>;
export type TeamDocument = HydratedDocument<Team>;

const existingTeamModel = mongoose.models.Team as mongoose.Model<TeamDocument> | undefined;

// In Next.js dev hot-reload, an older cached model can survive schema edits.
// Ensure category path exists on reused model so writes do not silently drop it.
if (existingTeamModel && !existingTeamModel.schema.path("category")) {
  existingTeamModel.schema.add({ category: { type: String } });
}

export default existingTeamModel || mongoose.model<TeamDocument>("Team", teamSchema);
