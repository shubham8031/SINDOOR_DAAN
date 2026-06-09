const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/search', require('./routes/search'));
app.use('/api/posts', require('./routes/posts'));
app.use('/api/shaadi', require('./routes/shaadi'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/payment', require('./routes/payment'));

// Health check - keeps server awake
app.get('/health', (req, res) => res.json({ status: 'ok', time: new Date() }));

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.log('❌ MongoDB Error:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Sindoor Daan V2 running on port ${PORT}`));
