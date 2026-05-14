import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import http from "http";

import connectDB from "./config/db.js";

import authRoute from "./routes/authRoutes.js";
import pollRutes from "./routes/pollRoutes.js";
import responseRoutes from "./routes/responseRoutes.js";

import { initSocket } from "./socket.js";

dotenv.config();

const app = express();

const server = http.createServer(app);

connectDB();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "Server is running",
  });
});

app.use("/api/auth", authRoute);
app.use("/api/polls", pollRutes);
app.use("/api/responses", responseRoutes);

initSocket(server);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
