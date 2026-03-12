const express = require('express');
const Portfolio = require('../models/Portfolio');
const router = express.Router();

// Get portfolio by username (Public / Dashboard)
router.get('/:username', async (req, res) => {
  try {
    const portfolio = await Portfolio.findOne({ username: req.params.username });
    if (!portfolio) {
      return res.status(404).json({ error: 'Portfolio not found' });
    }
    res.json(portfolio);
  } catch (error) {
    res.status(500).json({ error: 'Server error fetching portfolio' });
  }
});

// Update portfolio (Dashboard)
router.put('/:username', async (req, res) => {
  try {
    const portfolio = await Portfolio.findOneAndUpdate(
      { username: req.params.username },
      req.body,
      { new: true }
    );
    if (!portfolio) {
      return res.status(404).json({ error: 'Portfolio not found' });
    }
    res.json(portfolio);
  } catch (error) {
    res.status(500).json({ error: 'Server error updating portfolio' });
  }
});

module.exports = router;
