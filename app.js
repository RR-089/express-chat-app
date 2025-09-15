const express = require("express");
const authRoutes = require("./routes/authRoute");

const app = express();

app.use(express.json());
app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {
  res.json({ message: "Hello World" });
});

module.exports = app;
