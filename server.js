const http = require("http");
const { Server } = require("socket.io");
const app = require("./app");
const socketHandler = require("./socket/socket");

const server = http.createServer(app);

const io = new Server(server, { cors: { origin: "*" } });

socketHandler(io);

server.listen(process.env.PORT, () =>
  console.log(`Server running at port: ${process.env.PORT}`)
);
