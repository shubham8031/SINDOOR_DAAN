const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const auth = require('../middleware/auth');
const User = require('../models/User');

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
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password -faceDescriptor');
    res.json(user);
  } catch { res.status(500).json({ message: 'Server error' }); }
});

router.put('/profile', auth, async (req, res) => {
  try {
    const updates = req.body;
    delete updates.password;
    delete updates.faceDescriptor;
    const user = await User.findByIdAndUpdate(req.user.userId, updates, { new: true }).select('-password -faceDescriptor');
    res.json(user);
  } catch { res.status(500).json({ message: 'Server error' }); }
});

router.post('/upload-profile-photo', auth, upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file' });
    const photoUrl = `/uploads/${req.file.filename}`;
    await User.findByIdAndUpdate(req.user.userId, { profilePhoto: photoUrl });
    res.json({ photoUrl });
  } catch { res.status(500).json({ message: 'Server error' }); }
});

router.post('/upload-couple-photo', auth, upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file' });
    const photoUrl = `/uploads/${req.file.filename}`;
    await User.findByIdAndUpdate(req.user.userId, { $push: { couplePhotos: photoUrl } });
    res.json({ photoUrl });
  } catch { res.status(500).json({ message: 'Server error' }); }
});

router.delete('/couple-photo', auth, async (req, res) => {
  try {
    const { photoUrl } = req.body;
    await User.findByIdAndUpdate(req.user.userId, { $pull: { couplePhotos: photoUrl } });
    res.json({ message: 'Deleted' });
  } catch { res.status(500).json({ message: 'Server error' }); }
});

router.post('/save-face-descriptor', auth, async (req, res) => {
  try {
    const { descriptor } = req.body;
    if (!descriptor || !Array.isArray(descriptor)) return res.status(400).json({ message: 'Invalid descriptor' });
    await User.findByIdAndUpdate(req.user.userId, { faceDescriptor: descriptor });
    res.json({ message: 'Face saved' });
  } catch { res.status(500).json({ message: 'Server error' }); }
});

// Upgrade badge
router.post('/upgrade-badge', auth, async (req, res) => {
  try {
    const { badge } = req.body;
    const validBadges = ['silver', 'gold', 'diamond', 'platinum'];
    if (!validBadges.includes(badge)) return res.status(400).json({ message: 'Invalid badge' });
    const user = await User.findByIdAndUpdate(req.user.userId, { badge }, { new: true }).select('-password -faceDescriptor');
    res.json(user);
  } catch { res.status(500).json({ message: 'Server error' }); }
});

router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password -faceDescriptor -email -phone');
    if (!user || !user.isPublic) return res.status(404).json({ message: 'Not found' });
    res.json(user);
  } catch { res.status(500).json({ message: 'Server error' }); }
});

module.exports = router;
