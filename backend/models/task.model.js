import mongoose from 'mongoose';

/**
 * Task Schema definition
 * Production-ready task model with Kanban support, activity tracking, and rich metadata.
 */
const taskSchema = new mongoose.Schema(
  {
    // --- Basic Fields ---
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
      maxlength: [150, 'Task title cannot exceed 150 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
      default: '',
    },

    // --- Status (Kanban Columns) ---
    status: {
      type: String,
      enum: {
        values: ['todo', 'inprogress', 'done'],
        message: '{VALUE} is not a valid status',
      },
      default: 'todo',
    },

    // --- Priority ---
    priority: {
      type: String,
      enum: {
        values: ['low', 'medium', 'high'],
        message: '{VALUE} is not a valid priority',
      },
      default: 'medium',
    },

    // --- Dates ---
    dueDate: {
      type: Date,
    },
    completedAt: {
      type: Date,
      // Automatically set when status changes to 'done' via pre-save hook
    },

    // --- Relations ---
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'Task must belong to a project'],
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Task must have a creator'],
    },

    // --- Advanced Fields ---
    order: {
      type: Number,
      default: 0, // Used for drag-and-drop ordering within a Kanban column
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
    tags: {
      type: [String],
      default: [],
    },
    attachments: {
      type: [String], // Array of file URLs
      default: [],
    },

    // --- Activity Tracking ---
    lastUpdatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    lastUpdatedAt: {
      type: Date,
    },
  },
  {
    // --- Timestamps ---
    timestamps: true, // Manages createdAt and updatedAt
  }
);

// ==========================================
// Indexing for Scalability
// ==========================================

// Compound index: Quickly fetch all tasks for a project, sorted by status then order
taskSchema.index({ project: 1, status: 1, order: 1 });

// Index for fetching tasks assigned to a specific user
taskSchema.index({ assignedTo: 1 });

// Index for filtering by priority within a project
taskSchema.index({ project: 1, priority: 1 });

// ==========================================
// Hooks
// ==========================================

taskSchema.pre('save', async function () {
  // 1. If status changed to 'done', record the completion timestamp
  if (this.isModified('status') && this.status === 'done') {
    this.completedAt = Date.now();
  }

  // 2. If status changed away from 'done', clear completedAt
  if (this.isModified('status') && this.status !== 'done') {
    this.completedAt = undefined;
  }
});

// ==========================================
// Output Formatting
// ==========================================

taskSchema.methods.toJSON = function () {
  const task = this.toObject();
  delete task.__v;
  return task;
};

const Task = mongoose.model('Task', taskSchema);

export default Task;
