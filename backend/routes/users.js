const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const auth = require('../middleware/auth');
const User = require('../models/User');

// Multer storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = './uploads';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${Math.random().toString(36).substr(2, 9)}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype);
    if (ext && mime) cb(null, true);
    else cb(new Error('Only image files allowed'));
  }
});

// Get my profile
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password -faceDescriptor');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update profile
router.put('/profile', auth, async (req, res) => {
  try {
    const { name, age, city, occupation, phone, gender, status, partner, isPublic } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { name, age, city, occupation, phone, gender, status, partner, isPublic },
      { new: true }
    ).select('-password -faceDescriptor');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Upload profile photo
router.post('/upload-profile-photo', auth, upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    const photoUrl = `/uploads/${req.file.filename}`;
    await User.findByIdAndUpdate(req.user.userId, { profilePhoto: photoUrl });
    res.json({ photoUrl });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Upload couple photo
router.post('/upload-couple-photo', auth, upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    const photoUrl = `/uploads/${req.file.filename}`;
    await User.findByIdAndUpdate(
      req.user.userId,
      { $push: { couplePhotos: photoUrl } }
    );
    res.json({ photoUrl });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete couple photo
router.delete('/couple-photo', auth, async (req, res) => {
  try {
    const { photoUrl } = req.body;
    await User.findByIdAndUpdate(
      req.user.userId,
      { $pull: { couplePhotos: photoUrl } }
    );
    // Delete file from disk
    const filePath = `.${photoUrl}`;
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    res.json({ message: 'Photo deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Save face descriptor (sent from frontend after face detection)
router.post('/save-face-descriptor', auth, async (req, res) => {
  try {
    const { descriptor } = req.body;
    if (!descriptor || !Array.isArray(descriptor)) {
      return res.status(400).json({ message: 'Invalid descriptor' });
    }
    await User.findByIdAndUpdate(req.user.userId, { faceDescriptor: descriptor });
    res.json({ message: 'Face data saved successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user by ID (public profile)
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password -faceDescriptor -email -phone');
    if (!user || !user.isPublic) return res.status(404).json({ message: 'Profile not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
