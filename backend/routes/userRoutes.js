// backend/routes/userRoutes.js
const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const db = require("../config/db");
const { verifyToken } = require("../middleware/authMiddleware");

// 🧠 Get current logged-in user info
router.get("/me", verifyToken, async (req, res) => {
  try {
    const [rows] = await db.execute(
      "SELECT id, username, role, created_at FROM users WHERE id = ?",
      [req.user.id]
    );
    res.json({ success: true, user: rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error fetching profile" });
  }
});

// 🧠 Get all users (only for organization_admin)
router.get("/", verifyToken, async (req, res) => {
  try {
    const [authUser] = await db.execute("SELECT role FROM users WHERE id = ?", [req.user.id]);
    if (authUser[0].role !== "organization_admin") {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const [rows] = await db.execute("SELECT id, username, role, created_at FROM users");
    res.json({ success: true, users: rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error fetching users" });
  }
});

// 🧠 Update profile (self only)
router.put("/me", verifyToken, async (req, res) => {
  try {
    const { username, password } = req.body;
    const updates = [];
    const params = [];

    if (username) {
      updates.push("username = ?");
      params.push(username);
    }
    if (password) {
      const hash = await bcrypt.hash(password, 10);
      updates.push("password_hash = ?");
      params.push(hash);
    }

    if (updates.length === 0)
      return res.status(400).json({ success: false, message: "No fields to update" });

    params.push(req.user.id);
    const query = `UPDATE users SET ${updates.join(", ")} WHERE id = ?`;

    await db.execute(query, params);
    res.json({ success: true, message: "Profile updated" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error updating profile" });
  }
});

// 🧠 Create new user (only org_admin)
router.post("/create", verifyToken, async (req, res) => {
  try {
    const { username, password, role } = req.body;

    const [authUser] = await db.execute("SELECT role FROM users WHERE id = ?", [req.user.id]);
    if (authUser[0].role !== "organization_admin") {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const hash = await bcrypt.hash(password, 10);
    await db.execute(
      "INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)",
      [username, hash, role || "admin"]
    );

    res.json({ success: true, message: "User created successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error creating user" });
  }
});

// 🧠 Delete user (only org_admin)
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const userId = req.params.id;

    const [authUser] = await db.execute("SELECT role FROM users WHERE id = ?", [req.user.id]);
    if (authUser[0].role !== "organization_admin") {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    await db.execute("DELETE FROM users WHERE id = ?", [userId]);
    res.json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error deleting user" });
  }
});

module.exports = router;
