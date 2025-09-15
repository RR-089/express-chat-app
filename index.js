const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

const io = new Server(server, { cors: { origin: "*" } });

io.on("connection", (socket) => {
  console.log("New Socket Connected");

  socket.emit("welcome", { message: "Welcome", id: socket.id });

  socket.on("ping", (payload) => {
    console.log(`Received ping from ${socket.id}, with payload ${payload}`);
    socket.emit("pong", { time: Date.now(), received: payload });
  });

  socket.on("disconnect", (reason) => {
    console.log(`Client dissconected: ${socket.id}, ${reason}`);
  });
});

app.get("/", (req, res) => {
  res.json({ message: "Hello World" });
});

server.listen(process.env.PORT, () =>
  console.log(`Server running at port: ${process.env.PORT}`)
);
