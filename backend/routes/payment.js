const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');

const BADGE_PRICES = {
  silver: 9,
  gold: 49,
  diamond: 99,
  platinum: 199
};

// Get badge prices
router.get('/badge-prices', (req, res) => {
  res.json(BADGE_PRICES);
});

// Simulate payment (for now - will integrate Razorpay later)
router.post('/upgrade-badge', auth, async (req, res) => {
  try {
    const { badge, paymentId } = req.body;
    if (!BADGE_PRICES[badge]) return res.status(400).json({ message: 'Invalid badge' });

    // TODO: Verify Razorpay payment here
    // For now, direct upgrade
    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { badge },
      { new: true }
    ).select('-password -faceDescriptor');

    res.json({ success: true, user, message: `${badge} badge activated!` });
  } catch { res.status(500).json({ message: 'Server error' }); }
});

module.exports = router;
