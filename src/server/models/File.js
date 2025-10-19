import mongoose from 'mongoose';

const FileSchema = new mongoose.Schema({
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  parentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'File',
    default: null // null for root files/folders
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['folder', 'file'],
    required: true
  }
}, {
  timestamps: true // adds createdAt and updatedAt
});

// Indexes for performance
FileSchema.index({ projectId: 1, parentId: 1 });
FileSchema.index({ projectId: 1, type: 1 });

const File = mongoose.models.File || mongoose.model('File', FileSchema);
export default File;