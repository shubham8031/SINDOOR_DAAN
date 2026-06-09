const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  // Basic
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String },
  gender: { type: String, enum: ['male', 'female', 'other'] },
  age: { type: Number },
  dob: { type: Date },
  language: { type: String, enum: ['en', 'hi'], default: 'en' },

  // Location
  country: { type: String, default: 'India' },
  state: { type: String },
  district: { type: String },
  city: { type: String },
  currentCity: { type: String },
  pincode: { type: String },

  // Relationship
  status: { type: String, enum: ['single', 'taken', 'married'], default: 'single' },
  partner: {
    name: { type: String },
    relationshipType: { type: String }
  },

  // Photos
  profilePhoto: { type: String },
  couplePhotos: [{ type: String }],
  faceDescriptor: [{ type: Number }],

  // Badge & Verification
  badge: {
    type: String,
    enum: ['bronze', 'silver', 'gold', 'diamond', 'platinum'],
    default: 'bronze'
  },
  blueTick: { type: Boolean, default: false },
  postCount: { type: Number, default: 0 },
  isVerified: { type: Boolean, default: false },
  isPublic: { type: Boolean, default: true },

  // Profession
  occupation: { type: String },
  professionCategory: { type: String },
  subProfession: { type: String },

  // Shaadi profile
  shaadi: {
    isActive: { type: Boolean, default: false },
    religion: { type: String },
    caste: { type: String },
    subCaste: { type: String },
    intercasteOk: { type: Boolean, default: false },
    income: { type: String },
    education: { type: String },
    height: { type: String },
    weight: { type: String },
    about: { type: String },
    partnerPreference: { type: String },
    photos: [{ type: String }]
  },

  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
