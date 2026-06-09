const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Message = require('../models/Message');

// Send message
router.post('/send', auth, async (req, res) => {
  try {
    const { receiverId, text } = req.body;
    const message = new Message({
      sender: req.user.userId,
      receiver: receiverId,
      text
    });
    await message.save();
    res.json(message);
  } catch { res.status(500).json({ message: 'Server error' }); }
});

// Get conversation
router.get('/conversation/:userId', auth, async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [
        { sender: req.user.userId, receiver: req.params.userId },
        { sender: req.params.userId, receiver: req.user.userId }
      ]
    }).sort({ createdAt: 1 }).limit(100);
    res.json(messages);
  } catch { res.status(500).json({ message: 'Server error' }); }
});

// Get all chats
router.get('/chats', auth, async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [{ sender: req.user.userId }, { receiver: req.user.userId }]
    })
      .populate('sender', 'name profilePhoto badge blueTick')
      .populate('receiver', 'name profilePhoto badge blueTick')
      .sort({ createdAt: -1 });

    const chatMap = {};
    messages.forEach(msg => {
      const otherId = msg.sender._id.toString() === req.user.userId
        ? msg.receiver._id.toString()
        : msg.sender._id.toString();
      if (!chatMap[otherId]) {
        chatMap[otherId] = {
          user: msg.sender._id.toString() === req.user.userId ? msg.receiver : msg.sender,
          lastMessage: msg.text,
          createdAt: msg.createdAt
        };
      }
    });
    res.json(Object.values(chatMap));
  } catch { res.status(500).json({ message: 'Server error' }); }
});

module.exports = router;
