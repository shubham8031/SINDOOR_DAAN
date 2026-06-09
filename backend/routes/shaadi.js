const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = './uploads/shaadi';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, `shaadi-${Date.now()}${path.extname(file.originalname)}`);
  }
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

// Search shaadi profiles
router.get('/search', async (req, res) => {
  try {
    const { gender, caste, religion, profession, city, state, intercasteOk, minAge, maxAge } = req.query;
    let query = { 'shaadi.isActive': true, isPublic: true };
    if (gender) query.gender = gender === 'male' ? 'female' : 'male';
    if (caste && caste !== 'intercaste') query['shaadi.caste'] = { $regex: caste, $options: 'i' };
    if (religion) query['shaadi.religion'] = { $regex: religion, $options: 'i' };
    if (profession) query.professionCategory = { $regex: profession, $options: 'i' };
    if (city) query.city = { $regex: city, $options: 'i' };
    if (state) query.state = { $regex: state, $options: 'i' };
    if (minAge || maxAge) {
      query.age = {};
      if (minAge) query.age.$gte = parseInt(minAge);
      if (maxAge) query.age.$lte = parseInt(maxAge);
    }
    const profiles = await User.find(query)
      .select('-password -faceDescriptor -email -phone')
      .limit(50);
    res.json(profiles);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update shaadi profile
router.put('/profile', auth, async (req, res) => {
  try {
    const { shaadi } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { shaadi: { ...shaadi, isActive: true } },
      { new: true }
    ).select('-password -faceDescriptor');
    res.json(user);
  } catch { res.status(500).json({ message: 'Server error' }); }
});

// Upload shaadi photo
router.post('/upload-photo', auth, upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file' });
    const photoUrl = `/uploads/shaadi/${req.file.filename}`;
    await User.findByIdAndUpdate(
      req.user.userId,
      { $push: { 'shaadi.photos': photoUrl } }
    );
    res.json({ photoUrl });
  } catch { res.status(500).json({ message: 'Server error' }); }
});

module.exports = router;
