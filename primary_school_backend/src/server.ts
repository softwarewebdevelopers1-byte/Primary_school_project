import express, { type Response, type Request } from "express";
import DotEnvFile from "./config/env.js";
import dbConnection from "./database/db.js";
let app = express();
dbConnection();
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
