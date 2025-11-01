import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    files: {
      type: Object,
      default: {},
      required: true,
    },
    visibility: {
      type: String,
      enum: ["public", "private"],
      default: "private",
    },
    settings: {
      framework: {
        type: String,
        enum: ["react", "vue", "vanilla", "node"],
        default: "react",
      },
      autoSave: {
        type: Boolean,
        default: true,
      },
    },
  },
  {
    timestamps: true,
  },
);

const Project = mongoose.model("Project", projectSchema);
export default Project;
