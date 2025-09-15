const { PrismaClient } = require("@prisma/client");
const jwt = require("jsonwebtoken");

const prisma = new PrismaClient();
const userSockets = new Map();

const socketHandler = (io) => {
  io.use(async (socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token || socket.handshake.query?.token;

      if (!token) return next(new Error("No token provided"));

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
      });

      if (!user) return next(new Error("User not found"));

      socket.user = user;
      next();
    } catch (error) {
      console.error("Auth Error:", error);
      next(new Error("Auth failed"));
    }
  });

  io.on("connection", (socket) => {
    const userId = socket.user.id;

    if (!userSockets.has(userId)) {
      userSockets.set(userId, new Set());
    }

    userSockets.get(userId).add(socket.id);

    console.log(
      `User ${socket.user.username} connected. Active sockets: ${Array.from(
        userSockets.get(userId)
      )}`
    );

    socket.emit("welcome", { message: "Welcome", id: socket.id });

    socket.on("ping", (payload) => {
      console.log(`Received ping from ${socket.id}, with payload ${payload}`);
      socket.emit("pong", { time: Date.now(), received: payload });
    });

    socket.on("disconnect", () => {
      const sockets = userSockets.get(userId);

      sockets?.delete(socket.id);

      if (sockets?.size === 0) {
        userSockets.delete(userId);
      }

      console.log(`User ${socket.user.username} disconnected`);
    });
  });
};

module.exports = socketHandler;
