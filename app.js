const express = require("express");
const authRoutes = require("./routes/authRoute");
const messageRoutes = require("./routes/messageRoute");
const authMiddleware = require("./middleware/authMiddleware");

const app = express();

app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/messages", authMiddleware, messageRoutes);

app.get("/", (req, res) => {
  res.json({ message: "Hello World" });
});

module.exports = app;
