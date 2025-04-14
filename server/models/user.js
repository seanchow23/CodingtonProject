const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email:    { type: String, required: true, unique: true },
  password: { type: String, required: true },

  googleAuth: {
    googleId: String,         // for Google login
    accessToken: String
  },

  scenarios: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Scenario'           // links to scenarios the user created
  }],

  sharedScenarios: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Scenario'           // scenarios shared with this user
  }],

  stateTaxFiles: [{
    filename: String,         // uploaded YAML tax file name
    state: String,            // e.g., 'NY', 'NJ', etc.
    uploadedAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
