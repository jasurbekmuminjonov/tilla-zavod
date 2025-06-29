require("dotenv").config();
const { connectDB } = require("./config/db");
connectDB();
const express = require("express");
const cors = require("cors");
const authMiddleware = require("./middlewares/auth.middleware");

const app = express();
app.use(cors());
app.use(express.json());
app.use("/api/v1", authMiddleware, require("./router"));

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server http://localhost:${PORT}/api/v1 da ishga tushdi✅`);
});
