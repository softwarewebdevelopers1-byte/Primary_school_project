import mongoose from "mongoose";
import DotEnvFile from "../config/env.js";
const dbConnection = async (): Promise<void> => {
  let connection = await mongoose
    .connect(DotEnvFile.DatabaseConnectionString)
    .then(() => {
      
    })
    .catch((err) => {
      
    });
};
export default dbConnection;
