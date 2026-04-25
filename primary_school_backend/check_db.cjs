const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/primary_school";

async function check() {
  await mongoose.connect(uri);
  const db = mongoose.connection.db;
  const users = await db.collection("users").find({}).toArray();
  console.log("All Users:", JSON.stringify(users.map(u => ({ name: u.teachersName || u.studentsName, role: u.__t, class: u.class, stream: u.classStream })), null, 2));
  
  process.exit(0);
}

check();
