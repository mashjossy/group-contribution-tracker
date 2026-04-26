const express = require('express');
const router  = express.Router();
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const pool    = require('../db');

// REGISTER
router.post('/register', async (req, res) => {
  const { full_name, email, password } = req.body;
  try {
    const exists = await pool.query(
      'SELECT id FROM users WHERE email = $1', [email]
    );
    if (exists.rows.length > 0) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      'INSERT INTO users (full_name, email, password) VALUES ($1,$2,$3) RETURNING id, full_name, email',
      [full_name, email, hashedPassword]
    );

    res.status(201).json({
      message: 'Account created successfully!',
      user: result.rows[0]
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// LOGIN
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1', [email]
    );
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'No account found with that email' });
    }

    const user = result.rows[0];

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Incorrect password' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful!',
      token,
      user: { id: user.id, full_name: user.full_name, email: user.email, role: user.role }
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;