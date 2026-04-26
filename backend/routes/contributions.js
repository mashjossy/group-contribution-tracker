const express = require('express');
const router  = express.Router();
const pool    = require('../db');
const auth    = require('../middleware/auth');

// POST log a new payment
router.post('/', auth, async (req, res) => {
  const { group_id, user_id, amount, month, year, notes } = req.body;
  try {
    const existing = await pool.query(
      'SELECT id FROM contributions WHERE group_id=$1 AND user_id=$2 AND month=$3 AND year=$4',
      [group_id, user_id, month, year]
    );
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'Contribution for this month already recorded' });
    }

    const result = await pool.query(
      'INSERT INTO contributions (group_id,user_id,amount,month,year,notes) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *',
      [group_id, user_id, amount, month, year, notes]
    );

    res.status(201).json({ message: 'Contribution recorded!', contribution: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET all contributions for a group
router.get('/:groupId', auth, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT c.*, u.full_name
      FROM contributions c
      JOIN users u ON c.user_id = u.id
      WHERE c.group_id = $1
      ORDER BY c.year DESC, c.paid_at DESC
    `, [req.params.groupId]);

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET paid/unpaid status for a specific month
router.get('/:groupId/status/:month/:year', auth, async (req, res) => {
  const { groupId, month, year } = req.params;
  try {
    const result = await pool.query(`
      SELECT
        u.id,
        u.full_name,
        u.email,
        CASE WHEN c.id IS NOT NULL THEN 'paid' ELSE 'unpaid' END AS status,
        COALESCE(c.amount, 0) AS amount_paid,
        c.paid_at
      FROM group_members gm
      JOIN users u ON gm.user_id = u.id
      LEFT JOIN contributions c
        ON c.user_id = u.id AND c.group_id = $1 AND c.month = $2 AND c.year = $3
      WHERE gm.group_id = $1
      ORDER BY status ASC, u.full_name ASC
    `, [groupId, month, year]);

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET summary totals for a group
router.get('/:groupId/summary', auth, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        COUNT(DISTINCT user_id) AS total_contributors,
        SUM(amount)             AS total_collected,
        COUNT(*)                AS total_payments
      FROM contributions
      WHERE group_id = $1
    `, [req.params.groupId]);

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;