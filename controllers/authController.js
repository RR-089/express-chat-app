const register = (req, res) => {
  res.json({ message: "this is register route" });
};
const login = (req, res) => {
  res.json({ message: "this is login route" });
};

module.exports = { register, login };
