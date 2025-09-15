const express = require("express");
const authRoutes = require("./routes/authRoute");

const app = express();

app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {
  res.json({ message: "Hello World" });
});

module.exports = app;
