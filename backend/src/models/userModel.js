// backend/src/models/userModel.js

const db = require('../config/db');

const createUser = async ({ username, email, password, role }) => {
  const res = await db.query(
    `INSERT INTO users (username, email, password, role)
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [username, email, password, role]
  );
  return res.rows[0];
};

const getUserByEmail = async (email) => {
  const res = await db.query(
    'SELECT * FROM users WHERE email = $1',
    [email]
  );
  return res.rows[0];
};

module.exports = {
  createUser,
  getUserByEmail,
};
