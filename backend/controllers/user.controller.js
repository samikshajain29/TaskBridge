import User from '../models/user.model.js';
import Project from '../models/project.model.js';

// @desc    Search users by name or email
// @route   GET /api/users/search?query=
// @access  Private
export const searchUsers = async (req, res, next) => {
  try {
    const { query, projectId } = req.query;
    
    if (!query) {
      return res.status(200).json([]);
    }

    let excludeIds = [req.user._id];

    if (projectId) {
      const project = await Project.findById(projectId);
      if (project) {
        const memberIds = project.members.map(m => m.user);
        excludeIds = [...excludeIds, ...memberIds];
      }
    }

    // Find users matching query but exclude current user and existing members
    const users = await User.find({
      _id: { $nin: excludeIds },
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } }
      ]
    }).select('name email avatar').limit(10);

    res.status(200).json(users);
  } catch (error) {
    next(error);
  }
};
