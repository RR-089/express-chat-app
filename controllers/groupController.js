const prisma = require("./../prisma/prisma");

const getGroups = async (req, res) => {
  try {
    const userId = parseInt(req.userId);

    const groups = await prisma.group.findMany({
      where: { members: { some: { userId: userId } } },
    });

    res.json(groups);
  } catch (error) {
    console.error("Get groups error:", error);
    res.status(500).json({ error: "Failed to get groups" });
  }
};

const createGroup = async (req, res) => {
  try {
    const createdBy = req.userId;
    const { name } = req.body;

    const group = await prisma.group.create({
      data: {
        name,
        createdBy,
        members: {
          create: { userId: createdBy },
        },
      },
      include: {
        user: true,
      },
    });

    res.status(201).json({
      id: group.id,
      name: group.name,
      createdAt: group.createdAt,
      createdBy: {
        id: group.user.id,
        username: group.user.username,
      },
    });
  } catch (error) {
    console.error("Create group error:", error);
    res.status(500).json({ error: "Failed to create new group" });
  }
};

const getGroupMessages = async (req, res) => {
  try {
    const groupId = parseInt(req.params.groupId);

    const messages = await prisma.groupMessage.findMany({
      where: { groupId },
      orderBy: { createdAt: "asc" },
      include: { sender: true },
    });

    res.json(
      messages.map((msg) => ({
        id: msg.id,
        content: msg.content,
        sender: {
          id: msg.sender.id,
          username: msg.sender.username,
        },
      }))
    );
  } catch (error) {
    console.error("Get group messages error:", error);
    res.status(500).json({ message: "Failed to get group messages" });
  }
};

module.exports = { getGroups, createGroup, getGroupMessages };
