const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const prisma = require("./../prisma/prisma");

const register = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password)
      return res.json(400).json({ message: "invalid body" });

    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { username, password: hashed },
    });

    res.status(201).json({
      id: user.id,
      username: user.username,
    });
  } catch (error) {
    console.error("Register Error:", error);
    res.status(400).json({ error: "username may already exist" });
  }
};

const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password)
      return res.status(401).json({ message: "invalid body" });

    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) throw new Error("User not found");

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) throw new Error("Invalid credentials");

    const token = jwt.sign(
      { userId: user.id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "3d" }
    );

    res.json({ token });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(401).json({ error: "invalid credentials" });
  }
};

module.exports = { register, login };
