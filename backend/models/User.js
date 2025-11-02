const db = require('../config/db');
const bcrypt = require('bcrypt');

class User {
  static async findByUsername(username) {
    const [rows] = await db.execute('SELECT * FROM users WHERE username = ?', [username]);
    return rows[0];
  }

  static async create(username, password) {
    const hash = await bcrypt.hash(password, 10);
    await db.execute('INSERT INTO users (username, password_hash) VALUES (?, ?)', [username, hash]);
  }

  static async verifyPassword(password, hash) {
    return bcrypt.compare(password, hash);
  }
}

module.exports = User;
