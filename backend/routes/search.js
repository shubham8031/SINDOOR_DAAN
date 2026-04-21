const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Search by name, city, age
router.get('/by-name', async (req, res) => {
  try {
    const { name, city, age, gender } = req.query;
    let query = { isPublic: true };

    if (name) query.name = { $regex: name, $options: 'i' };
    if (city) query.city = { $regex: city, $options: 'i' };
    if (gender) query.gender = gender;
    if (age) {
      const ageNum = parseInt(age);
      query.age = { $gte: ageNum - 2, $lte: ageNum + 2 };
    }

    const users = await User.find(query)
      .select('-password -faceDescriptor -email -phone')
      .limit(20);

    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Face match search - frontend sends descriptor array, we compare with DB
router.post('/by-face', async (req, res) => {
  try {
    const { descriptor } = req.body;
    if (!descriptor || !Array.isArray(descriptor)) {
      return res.status(400).json({ message: 'Invalid face data' });
    }

    // Get all users with face descriptors
    const users = await User.find({
      isPublic: true,
      faceDescriptor: { $exists: true, $not: { $size: 0 } }
    }).select('-password -email -phone');

    // Calculate Euclidean distance between descriptors
    const euclideanDistance = (desc1, desc2) => {
      if (desc1.length !== desc2.length) return Infinity;
      let sum = 0;
      for (let i = 0; i < desc1.length; i++) {
        sum += Math.pow(desc1[i] - desc2[i], 2);
      }
      return Math.sqrt(sum);
    };

    // Find matches (threshold 0.6 is standard for face-api.js)
    const THRESHOLD = 0.6;
    const matches = [];

    for (const user of users) {
      if (user.faceDescriptor && user.faceDescriptor.length === descriptor.length) {
        const distance = euclideanDistance(descriptor, user.faceDescriptor);
        if (distance < THRESHOLD) {
          matches.push({
            user: {
              _id: user._id,
              name: user.name,
              age: user.age,
              city: user.city,
              occupation: user.occupation,
              gender: user.gender,
              status: user.status,
              partner: user.partner,
              profilePhoto: user.profilePhoto,
              couplePhotos: user.couplePhotos
            },
            confidence: Math.round((1 - distance / THRESHOLD) * 100),
            distance
          });
        }
      }
    }

    // Sort by confidence
    matches.sort((a, b) => b.confidence - a.confidence);

    res.json({ matches, total: matches.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
