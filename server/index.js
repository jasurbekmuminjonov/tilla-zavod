require("dotenv").config();
const { connectDB } = require("./config/db");
connectDB();
const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server http://localhost:${PORT}/api/v1 da ishga tushdi✅`);
});
