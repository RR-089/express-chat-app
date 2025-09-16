const prisma = require("./../prisma/prisma");

const getMessages = async (req, res) => {
  try {
    const otherUserId = parseInt(req.params.otherUserId);
    const userId = req.userId;

    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId, receiverId: otherUserId },
          { senderId: otherUserId, receiverId: userId },
        ],
      },
      orderBy: { createdAt: "asc" },
    });

    res.json(messages);
  } catch (error) {
    console.error("Get messages error:", error);
    res.status(500).json({ error: "failed to fetch messages" });
  }
};

module.exports = {
  getMessages,
};
