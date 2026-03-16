const mongoose = require('mongoose');

const PortfolioSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  name: String,
  title: String,
  about: String,
  skills: [String],
  projects: [{
    title: String,
    description: String,
    link: String
  }],
  experience: [{
    role: String,
    company: String,
    duration: String,
    description: String
  }],
  education: [{
    degree: String,
    institution: String,
    year: String
  }],
  contact: {
    email: String,
    linkedin: String,
    github: String,
    website: String,
  },
  theme: {
    type: String,
    default: 'minimal'
  },
  workFiles: [{
    url: String,
    fileType: String,
    name: String
  }],
  resumeUrl: String,
  profileImageUrl: String
}, { timestamps: true });

module.exports = mongoose.model('Portfolio', PortfolioSchema);
