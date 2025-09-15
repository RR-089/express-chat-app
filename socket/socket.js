const { PrismaClient } = require("@prisma/client");
const jwt = require("jsonwebtoken");

const prisma = new PrismaClient();

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
    console.log(
      `New Socket Connected: ${socket.id}, user: ${socket.user.username}`
    );

    socket.emit("welcome", { message: "Welcome", id: socket.id });

    socket.on("ping", (payload) => {
      console.log(`Received ping from ${socket.id}, with payload ${payload}`);
      socket.emit("pong", { time: Date.now(), received: payload });
    });

    socket.on("disconnect", (reason) => {
      console.log(`Client dissconected: ${socket.id}, ${reason}`);
    });
  });
};

module.exports = socketHandler;
