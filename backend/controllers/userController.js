const db = require('../config/db');
const bcrypt = require('bcrypt');

// ✅ Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT id, username, role, created_at FROM users');
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ success: false, message: 'Server error fetching users' });
  }
};

// ✅ Create new user
exports.createUser = async (req, res) => {
  try {
    const { username, password, role } = req.body;
    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Username and password are required' });
    }

    const hash = await bcrypt.hash(password, 10);
    await db.execute('INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)', [
      username,
      hash,
      role || 'admin',
    ]);

    res.json({ success: true, message: 'User created successfully' });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ success: false, message: 'Server error creating user' });
  }
};

// ✅ Update user (e.g. change password or role)
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, password, role } = req.body;

    let query = 'UPDATE users SET ';
    const params = [];

    if (username) {
      query += 'username = ?, ';
      params.push(username);
    }

    if (password) {
      const hash = await bcrypt.hash(password, 10);
      query += 'password_hash = ?, ';
      params.push(hash);
    }

    if (role) {
      query += 'role = ?, ';
      params.push(role);
    }

    // Remove last comma
    query = query.slice(0, -2) + ' WHERE id = ?';
    params.push(id);

    await db.execute(query, params);
    res.json({ success: true, message: 'User updated successfully' });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ success: false, message: 'Server error updating user' });
  }
};

// ✅ Delete user
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    await db.execute('DELETE FROM users WHERE id = ?', [id]);
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ success: false, message: 'Server error deleting user' });
  }
};
