const express = require("express");

const app = express();

app.get("/", (req, res) => {
  res.json({ message: "Hello World" });
});

app.listen(process.env.PORT, () =>
  console.log(`Server running at port: ${process.env.PORT}`)
);
