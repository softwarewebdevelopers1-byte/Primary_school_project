import { app } from "./app";
import { connectDatabase } from "./config/db";
import { env } from "./config/env";
import { seedDatabase } from "./services/seedDatabase";

const start = async () => {
  await connectDatabase();
  await seedDatabase();

  app.listen(env.port, () => {
    console.log(`Primary school backend running on http://localhost:${env.port}`);
  });
};

start().catch((error) => {
  console.error("Failed to start backend", error);
  process.exit(1);
});
