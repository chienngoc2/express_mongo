const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    // Use MONGO_URI from environment variables, fallback to localhost for local dev
    const uri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/SimpleQuiz";
    await mongoose.connect(uri);

    console.log("MongoDB Connected");
  } catch (error) {
    console.log(error);
  }
};

module.exports = connectDB;
