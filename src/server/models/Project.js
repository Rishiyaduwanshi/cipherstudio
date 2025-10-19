import mongoose from 'mongoose';

const ProjectSchema = new mongoose.Schema({
  projectSlug: {
    type: String,
    required: true,
    unique: true,
    index: true // public-friendly slug
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null // null for non-auth users
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: '',
    trim: true
  },
  rootFolderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "File" // top-level folder
  },
  settings: {
    framework: {
      type: String,
      default: "react"
    },
    autoSave: {
      type: Boolean,
      default: true
    }
  }
}, {
  timestamps: true // adds createdAt and updatedAt
});

// Indexes for performance
ProjectSchema.index({ projectSlug: 1 });
ProjectSchema.index({ userId: 1, createdAt: -1 });

const Project = mongoose.models.Project || mongoose.model('Project', ProjectSchema);
export default Project;