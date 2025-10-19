import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    index: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true // hashed password (bcrypt)
  },
  mobile: {
    type: String,
    trim: true
  },
  lastLoggedIn: {
    type: Date,
    default: Date.now
  },
  settings: {
    theme: {
      type: String,
      enum: ["light", "dark"],
      default: "light"
    }
  }
}, {
  timestamps: true // adds createdAt and updatedAt
});

// Index for better performance
UserSchema.index({ email: 1 });

const User = mongoose.models.User || mongoose.model('User', UserSchema);
export default User;