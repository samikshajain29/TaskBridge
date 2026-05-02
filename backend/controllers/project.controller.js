import Project from '../models/project.model.js';
import User from '../models/user.model.js';

// @desc    Create a project
// @route   POST /api/projects
// @access  Private
export const createProject = async (req, res, next) => {
  try {
    const { name, description, color } = req.body;

    const project = await Project.create({
      name,
      description,
      color,
      creator: req.user._id,
    });

    res.status(201).json(project);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all projects user is a member of
// @route   GET /api/projects
// @access  Private
export const getProjects = async (req, res, next) => {
  try {
    // Find projects where the members array contains an object with this user's ID
    const projects = await Project.find({
      'members.user': req.user._id,
    }).populate('members.user', 'name email avatar');

    res.status(200).json(projects);
  } catch (error) {
    next(error);
  }
};

// @desc    Get single project
// @route   GET /api/projects/:id
// @access  Private (Role: member)
export const getProjectById = async (req, res, next) => {
  try {
    // req.project is already populated by checkProjectRole middleware if valid
    await req.project.populate('members.user', 'name email avatar');
    res.status(200).json(req.project);
  } catch (error) {
    next(error);
  }
};

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private (Role: admin)
export const updateProject = async (req, res, next) => {
  try {
    const { name, description, color } = req.body;
    
    const project = req.project;

    if (name) project.name = name;
    if (description !== undefined) project.description = description;
    if (color) project.color = color;

    const updatedProject = await project.save();
    await updatedProject.populate('members.user', 'name email avatar');

    res.status(200).json(updatedProject);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private (Role: admin)
export const deleteProject = async (req, res, next) => {
  try {
    await Project.deleteOne({ _id: req.project._id });
    res.status(200).json({ message: 'Project removed successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Add member to project
// @route   POST /api/projects/:id/members
// @access  Private (Role: admin)
export const addMember = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const userToAdd = await User.findOne({ email });

    if (!userToAdd) {
      return res.status(404).json({ message: 'User not found with this email' });
    }

    const project = req.project;

    // Check if user is already a member
    const isAlreadyMember = project.members.find(
      (m) => m.user.toString() === userToAdd._id.toString()
    );

    if (isAlreadyMember) {
      return res.status(400).json({ message: 'User is already a member of this project' });
    }

    // Add as member (default role)
    project.members.push({
      user: userToAdd._id,
      role: 'member',
    });

    await project.save();
    await project.populate('members.user', 'name email avatar');

    res.status(200).json(project);
  } catch (error) {
    next(error);
  }
};

// @desc    Remove member from project
// @route   DELETE /api/projects/:id/members/:userId
// @access  Private (Role: admin)
export const removeMember = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const project = req.project;

    // Check if the user exists in the project
    const memberIndex = project.members.findIndex(
      (m) => m.user.toString() === userId
    );

    if (memberIndex === -1) {
      return res.status(404).json({ message: 'User is not a member of this project' });
    }

    const memberToRemove = project.members[memberIndex];

    // If removing an admin, ensure they are not the last admin
    if (memberToRemove.role === 'admin') {
      const adminCount = project.members.filter((m) => m.role === 'admin').length;
      if (adminCount <= 1) {
        return res.status(400).json({ message: 'Cannot remove the last admin of the project' });
      }
    }

    project.members.splice(memberIndex, 1);
    await project.save();
    
    res.status(200).json({ message: 'Member removed successfully' });
  } catch (error) {
    next(error);
  }
};
