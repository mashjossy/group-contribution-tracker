const express = require('express');
const router  = express.Router();
const pool    = require('../db');
const auth    = require('../middleware/auth');

// GET all members of a group
router.get('/:groupId', auth, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT u.id, u.full_name, u.email, gm.joined_at
      FROM group_members gm
      JOIN users u ON gm.user_id = u.id
      WHERE gm.group_id = $1
      ORDER BY gm.joined_at ASC
    `, [req.params.groupId]);

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST add a member to a group by email
router.post('/:groupId', auth, async (req, res) => {
  const { email } = req.body;
  try {
    // Find user by email
    const userResult = await pool.query(
      'SELECT id, full_name FROM users WHERE email = $1', [email]
    );
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'No user found with that email' });
    }

    const newMember = userResult.rows[0];

    // Check if already a member
    const alreadyMember = await pool.query(
      'SELECT id FROM group_members WHERE group_id=$1 AND user_id=$2',
      [req.params.groupId, newMember.id]
    );
    if (alreadyMember.rows.length > 0) {
      return res.status(400).json({ error: 'User is already a member' });
    }

    await pool.query(
      'INSERT INTO group_members (group_id, user_id) VALUES ($1, $2)',
      [req.params.groupId, newMember.id]
    );

    // Send notification to new member
    await pool.query(
      'INSERT INTO notifications (user_id, group_id, message) VALUES ($1, $2, $3)',
      [newMember.id, req.params.groupId, 'You have been added to a contribution group.']
    );

    res.status(201).json({ message: `${newMember.full_name} added to group` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;