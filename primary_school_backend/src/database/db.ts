import mongoose from "mongoose";
import DotEnvFile from "../config/env.js";
const dbConnection = async (): Promise<void> => {
  let connection = await mongoose
    .connect(DotEnvFile.DatabaseConnectionString)
    .then(() => {
      console.log("Database connected");
    })
    .catch((err) => {
      console.log(`Database connection failed ${err}`);
    });
};
export default dbConnection;
