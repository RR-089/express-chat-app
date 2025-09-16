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

    socket.on("private_message", async ({ to, content }) => {
      try {
        const message = await prisma.message.create({
          data: {
            senderId: userId,
            receiverId: to,
            content,
          },
        });

        const payload = {
          id: message.id,
          from: message.senderId,
          to: message.receiverId,
          content: message.content,
          createdAt: message.createdAt,
        };

        for (const senderSockets of userSockets.get(userId)) {
          io.to(senderSockets).emit("private_message", payload);
        }

        const receiverSockets = userSockets.get(message.receiverId);
        if (receiverSockets) {
          for (const receiverSockets of userSockets.get(to)) {
            io.to(receiverSockets).emit("private_message", payload);
          }
        }
      } catch (error) {
        console.error("Private message error:", error);
        socket.emit("error_message", { error: "Falied to send message" });
      }
    });

    socket.on("join_group", async ({ groupId }) => {
      try {
        const isMember = await prisma.groupMember.findUnique({
          where: {
            groupId_userId: { userId: userId, groupId },
          },
        });

        if (!isMember) {
          await prisma.groupMember.create({ data: { userId, groupId } });
        }

        socket.join(`group:${groupId}`);
        socket.emit("joined_group", { groupId });
        console.log(`${socket.user.username} joined group ${groupId}`);
      } catch (error) {
        console.error("Join group error:", error);
        socket.emit("error_message", { error: "Failed to join group" });
      }
    });

    socket.on("group_message", async ({ groupId, content }) => {
      const message = await prisma.groupMessage.create({
        data: {
          groupId,
          content,
          senderId: userId,
        },
      });

      const payload = {
        id: message.id,
        groupId: message.groupId,
        from: message.senderId,
        content: message.content,
        createdAt: message.createdAt,
      };

      io.to(`group:${groupId}`).emit("group_message", payload);
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
