const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  age: { type: Number },
  city: { type: String },
  occupation: { type: String },
  phone: { type: String },
  gender: { type: String, enum: ['male', 'female', 'other'] },
  status: { type: String, enum: ['single', 'taken', 'married'], default: 'single' },
  profilePhoto: { type: String },
  // Partner info
  partner: {
    name: { type: String },
    relationshipType: { type: String, enum: ['boyfriend', 'girlfriend', 'husband', 'wife', 'fiance', 'fiancee'] }
  },
  // Couple photos uploaded by user
  couplePhotos: [{ type: String }],
  // Face descriptor array from face-api.js (128 numbers)
  faceDescriptor: [{ type: Number }],
  // Is profile public?
  isPublic: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
