const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Euclidean distance
const euclideanDistance = (d1, d2) => {
  if (!d1 || !d2 || d1.length !== d2.length) return Infinity;
  return Math.sqrt(d1.reduce((sum, val, i) => sum + Math.pow(val - d2[i], 2), 0));
};

// Face search
router.post('/by-face', async (req, res) => {
  try {
    const { descriptor } = req.body;
    if (!descriptor || !Array.isArray(descriptor)) return res.status(400).json({ message: 'Invalid face data' });

    const users = await User.find({
      isPublic: true,
      faceDescriptor: { $exists: true, $not: { $size: 0 } }
    }).select('-password -email -phone');

    const THRESHOLD = 0.55;
    const matches = [];

    for (const user of users) {
      if (user.faceDescriptor && user.faceDescriptor.length > 0) {
        const distance = euclideanDistance(descriptor, user.faceDescriptor);
        if (distance < THRESHOLD) {
          matches.push({
            user: {
              _id: user._id,
              name: user.name,
              age: user.age,
              city: user.city,
              state: user.state,
              occupation: user.occupation,
              gender: user.gender,
              status: user.status,
              partner: user.partner,
              profilePhoto: user.profilePhoto,
              couplePhotos: user.couplePhotos,
              badge: user.badge,
              blueTick: user.blueTick
            },
            confidence: Math.round((1 - distance / THRESHOLD) * 100),
            distance
          });
        }
      }
    }

    matches.sort((a, b) => b.confidence - a.confidence);
    res.json({ matches, total: matches.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Name/city search
router.get('/by-name', async (req, res) => {
  try {
    const { name, city, age, gender, state } = req.query;
    let query = { isPublic: true };
    if (name) query.name = { $regex: name, $options: 'i' };
    if (city) query.$or = [
      { city: { $regex: city, $options: 'i' } },
      { currentCity: { $regex: city, $options: 'i' } }
    ];
    if (state) query.state = { $regex: state, $options: 'i' };
    if (gender) query.gender = gender;
    if (age) {
      const ageNum = parseInt(age);
      query.age = { $gte: ageNum - 3, $lte: ageNum + 3 };
    }
    const users = await User.find(query)
      .select('-password -faceDescriptor -email -phone')
      .limit(30);
    res.json(Array.isArray(users) ? users : []);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
