const express = require('express');
const router  = express.Router();
const pool    = require('../db');
const auth    = require('../middleware/auth');

// GET all groups for logged in user
router.get('/', auth, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT g.*, u.full_name AS admin_name,
             COUNT(gm.user_id) AS member_count
      FROM groups g
      JOIN users u ON g.admin_id = u.id
      LEFT JOIN group_members gm ON g.id = gm.group_id
      WHERE g.admin_id = $1
         OR g.id IN (SELECT group_id FROM group_members WHERE user_id = $1)
      GROUP BY g.id, u.full_name
      ORDER BY g.created_at DESC
    `, [req.user.id]);

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create a new group
router.post('/', auth, async (req, res) => {
  const { name, description, monthly_target } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO groups (name, description, monthly_target, admin_id) VALUES ($1,$2,$3,$4) RETURNING *',
      [name, description, monthly_target, req.user.id]
    );

    // Add creator as first member automatically
    await pool.query(
      'INSERT INTO group_members (group_id, user_id) VALUES ($1, $2)',
      [result.rows[0].id, req.user.id]
    );

    res.status(201).json({ message: 'Group created!', group: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single group by id
router.get('/:id', auth, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM groups WHERE id = $1', [req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Group not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;