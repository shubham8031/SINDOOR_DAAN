const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const auth = require('../middleware/auth');
const Post = require('../models/Post');
const User = require('../models/User');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = './uploads';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, `post-${Date.now()}${path.extname(file.originalname)}`);
  }
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

// Create post
router.post('/', auth, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'Image required' });
    const post = new Post({
      user: req.user.userId,
      image: `/uploads/${req.file.filename}`,
      caption: req.body.caption || ''
    });
    await post.save();
    // Update post count and check blue tick
    const user = await User.findById(req.user.userId);
    const newCount = (user.postCount || 0) + 1;
    const updates = { postCount: newCount };
    if (newCount >= 100) updates.blueTick = true;
    await User.findByIdAndUpdate(req.user.userId, updates);
    res.json(post);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all posts (feed)
router.get('/feed', async (req, res) => {
  try {
    const posts = await Post.find()
      .populate('user', 'name profilePhoto badge blueTick status')
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(posts);
  } catch { res.status(500).json({ message: 'Server error' }); }
});

// Get user posts
router.get('/user/:userId', async (req, res) => {
  try {
    const posts = await Post.find({ user: req.params.userId })
      .populate('user', 'name profilePhoto badge blueTick')
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch { res.status(500).json({ message: 'Server error' }); }
});

// Like post
router.post('/:id/like', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    const liked = post.likes.includes(req.user.userId);
    if (liked) {
      post.likes = post.likes.filter(id => id.toString() !== req.user.userId);
    } else {
      post.likes.push(req.user.userId);
    }
    await post.save();
    res.json({ likes: post.likes.length, liked: !liked });
  } catch { res.status(500).json({ message: 'Server error' }); }
});

// Comment
router.post('/:id/comment', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    post.comments.push({ user: req.user.userId, text: req.body.text });
    await post.save();
    res.json(post.comments);
  } catch { res.status(500).json({ message: 'Server error' }); }
});

module.exports = router;
