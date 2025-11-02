import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import db from "../config/db.js";

const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key";

export const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password)
      return res.status(400).json({ success: false, message: "Username and password are required" });

    // ✅ Check user
    const [users] = await db.execute("SELECT * FROM users WHERE username = ?", [username]);
    if (users.length === 0)
      return res.status(401).json({ success: false, message: "Invalid username or password" });

    const user = users[0];

    // ✅ Verify password
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword)
      return res.status(401).json({ success: false, message: "Invalid username or password" });

    // ✅ Generate JWT
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role
      }
    });
  } catch (err) {
    console.error("Error during login:", err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
