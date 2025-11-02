import bcrypt from 'bcryptjs';
import db from './config/db.js';

const createAdmin = async () => {
  const hashed = bcrypt.hashSync('admin123', 10);
  await db.execute(
    "INSERT INTO users (username, password, role) VALUES (?, ?, ?)",
    ['admin', hashed, 'admin']
  );
  console.log('✅ Admin user created: username=admin password=admin123');
  process.exit();
};

createAdmin();
