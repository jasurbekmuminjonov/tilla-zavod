require("dotenv").config();
const { connectDB } = require("./config/db");
connectDB();
const express = require("express");
const cors = require("cors");
const authMiddleware = require("./middlewares/auth.middleware");
const app = express();
const { createServer } = require("node:http");
const server = createServer(app);
const soket = require("./socket");
const io = require("./middlewares/socket.header")(server);
app.set("socket", io);
soket.connect(io);
app.use(cors());
app.use(express.json());
app.use("/api/v1", authMiddleware, require("./router"));

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`Server http://localhost:${PORT}/api/v1 da ishga tushdi✅`);
});
