import mongoose from 'mongoose';
import crypto from 'crypto';

/**
 * Project Schema definition
 * Provides core fields, ownership, membership tracking, and advanced real-world features.
 */
const projectSchema = new mongoose.Schema(
  {
    // --- Core Fields ---
    name: {
      type: String,
      required: [true, 'Project name is required'],
      trim: true,
      maxlength: [100, 'Project name cannot exceed 100 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
      default: '',
    },
    color: {
      type: String,
      // Defaults to a random hex if not provided, handled in pre-save hook
    },

    // --- Ownership ---
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Project must have a creator'],
    },

    // --- Members ---
    members: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        role: {
          type: String,
          enum: ['admin', 'member'],
          default: 'member',
        },
        joinedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // --- Advanced Fields ---
    isArchived: {
      type: Boolean,
      default: false,
    },
    lastActivityAt: {
      type: Date,
      default: Date.now,
    },
    inviteCode: {
      type: String,
      unique: true,
      sparse: true, // sparse allows multiple docs with no inviteCode if we didn't always enforce it
    },
  },
  {
    // --- Timestamps ---
    timestamps: true, // Automatically manages createdAt and updatedAt
  }
);

// ==========================================
// Indexing for Scalability
// ==========================================

// Index on members.user for fast retrieval of "My Projects" queries
projectSchema.index({ 'members.user': 1 });

// Index on creator for quick lookups of projects owned by a specific user
projectSchema.index({ creator: 1 });

// ==========================================
// Instance Methods
// ==========================================

/**
 * Check if a specific user is an admin in this project
 * @param {ObjectId|String} userId 
 * @returns {Boolean}
 */
projectSchema.methods.isAdmin = function (userId) {
  const member = this.members.find((m) => m.user.toString() === userId.toString());
  return member && member.role === 'admin';
};

/**
 * Check if a specific user is a member of this project
 * @param {ObjectId|String} userId 
 * @returns {Boolean}
 */
projectSchema.methods.isMember = function (userId) {
  return this.members.some((m) => m.user.toString() === userId.toString());
};

// ==========================================
// Hooks
// ==========================================

projectSchema.pre('save', async function () {
  // 1. Generate random hex color if none provided
  if (!this.color) {
    this.color = '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
  }

  // 2. Generate unique invite code if not exists
  if (!this.inviteCode) {
    this.inviteCode = crypto.randomBytes(6).toString('hex');
  }

  // 3. Update lastActivityAt on specific modifications
  if (this.isModified('name') || this.isModified('members') || this.isModified('description')) {
    this.lastActivityAt = Date.now();
  }

  // 4. Ensure creator is added as admin in members array (mainly for creation)
  if (this.isNew) {
    const creatorExists = this.members.some((m) => m.user.toString() === this.creator.toString());
    if (!creatorExists) {
      this.members.push({
        user: this.creator,
        role: 'admin',
        joinedAt: Date.now(),
      });
    }
  }

  // 5. Validation: Ensure at least one admin exists in the project
  const adminCount = this.members.filter((m) => m.role === 'admin').length;
  if (adminCount === 0) {
    throw new Error('A project must have at least one admin');
  }
});

// ==========================================
// Output Formatting
// ==========================================

/**
 * Override toJSON to hide unnecessary fields and clean the JSON response
 */
projectSchema.methods.toJSON = function () {
  const project = this.toObject();
  
  // Clean up MongoDB specific versioning
  delete project.__v;
  
  return project;
};

const Project = mongoose.model('Project', projectSchema);

export default Project;
