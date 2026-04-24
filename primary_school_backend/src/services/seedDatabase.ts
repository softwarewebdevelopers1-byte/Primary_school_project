import { RoleDatasetModel } from "../models/RoleDataset";
import { UserModel } from "../models/User";
import { seedDatasets, seedUsers } from "../data/seed";

export const seedDatabase = async () => {
  if ((await UserModel.countDocuments()) === 0) {
    await UserModel.insertMany(seedUsers);
  }

  if ((await RoleDatasetModel.countDocuments()) === 0) {
    await RoleDatasetModel.insertMany(seedDatasets);
  }
};
