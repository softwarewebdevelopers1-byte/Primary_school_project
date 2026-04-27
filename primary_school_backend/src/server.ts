import express, { type Response, type Request } from "express";
import cors from "cors";
import DotEnvFile from "./config/env.js";
import dbConnection from "./database/db.js";
import { newStudent, newStaff } from "./data/seed.js";
import userRoutes from "./routes/users.js";
import schoolRoutes from "./routes/school.js";
import marksRoutes from "./routes/marks.js";
import mongoose from "mongoose";

let app = express();

app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:5174"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true, // If you're using cookies/sessions
  }),
);
app.use(express.json());

// Simple request logger
app.use((req, res, next) => {
  next();
});

dbConnection();
newStudent();
newStaff();

app.use("/api/users", userRoutes);
app.use("/api/school", schoolRoutes);
app.use("/api/marks", marksRoutes);

app.listen(DotEnvFile.DEVPort, (): void => {
  console.log(`Server is running on port ${DotEnvFile.DEVPort}`);
});

function GracefulShutdown() {
  console.log("Shutting down gracefully...");
  mongoose.connection
    .close()
    .then(() => {
      console.log("Database connection closed.");
    })
    .catch((err) => {
      console.error("Error closing database connection:", err);
    })
    .finally(() => {
      process.exit(0);
    });
}
// signal of interruption
process.on("SIGINT", GracefulShutdown);
// signal of termination
process.on("SIGTERM", GracefulShutdown);
