// server.js
import express from "express";
import connectDB from "./config/postgres.js";

const app = express();
const PORT = process.env.PORT || 4000;

// Connect to Database
connectDB();

app.get("/", (req, res) => {
  res.send("API is running...");
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
    