import { Schema, model } from "mongoose";

const roleDatasetSchema = new Schema(
  {
    key: { type: String, required: true, unique: true },
    payload: { type: Schema.Types.Mixed, required: true },
  },
  { timestamps: true },
);

export const RoleDatasetModel = model("RoleDataset", roleDatasetSchema);
