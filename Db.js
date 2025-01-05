const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

async function createDbConnection() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Successfully connected to the database");
  } catch (err) {
    console.log("Database connection error:", err);
  }
}

module.exports = {
  createDbConnection,
};
