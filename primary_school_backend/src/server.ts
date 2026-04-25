import express, { type Response, type Request } from "express";
import DotEnvFile from "./config/env.js";
import dbConnection from "./database/db.js";
import { newAdmin, newStudent } from "./data/seed.js";
let app = express();
dbConnection();
newStudent();
newAdmin();
app.listen(DotEnvFile.DEVPort, (): void => {
  console.log("server started at port", DotEnvFile.DEVPort);
});

function GracefulShutdown(): void {
  console.log("Server shutting down");
}
// signal of interruption
process.on("SIGINT", GracefulShutdown);
// signal of termination
process.on("SIGTERM", GracefulShutdown);
