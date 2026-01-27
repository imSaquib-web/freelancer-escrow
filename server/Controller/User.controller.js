import userDB from "../Model/User.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const getMe = async (req, res) => {
  const user = await userDB
    .findById(req.user.id)
    .select("name email role walletBalance");
  res.json(user);
};

const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if user already exists
    const exist = await userDB.findOne({ email });
    if (exist) {
      return res.status(500).json({ msg: "user already exists" });
    }
    // Hash password and create new user
    const hash = await bcrypt.hash(password, 10);
    const user = await userDB.create({ name, email, password: hash, role });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );
    res.json(token);
  } catch (err) {
    res
      .status(500)
      .json({ msg: "got error while regitering", err: err.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Verify user exists
    const exist = await userDB.findOne({ email });
    if (!exist) {
      return res.status(500).json({ msg: "user not already exists" });
    }
    // Compare provided password with stored hash
    const isMatch = await bcrypt.compare(password, exist.password);
    if (!isMatch) {
      return res.status(500).json({ msg: "Wrong password" });
    }
    // Generate JWT token valid for 7 days
    const token = jwt.sign(
      { id: exist._id, role: exist.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );
    res.json(token);
  } catch (err) {
    res.status(500).json({ msg: "got error while login", err });
  }
};

export default { register, login, getMe };
