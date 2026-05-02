import Project from '../models/project.model.js';

/**
 * Middleware to check if the current user has the required role in a project
 * @param {string} requiredRole - 'admin' or 'member'
 */
export const checkProjectRole = (requiredRole = 'member') => {
  return async (req, res, next) => {
    try {
      const projectId = req.params.id;

      // Validate ObjectId
      if (!projectId || !projectId.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(400).json({ message: 'Invalid Project ID' });
      }

      const project = await Project.findById(projectId);

      if (!project) {
        return res.status(404).json({ message: 'Project not found' });
      }

      // Find user in members array
      const member = project.members.find(
        (m) => m.user.toString() === req.user._id.toString()
      );

      if (!member) {
        return res.status(403).json({ message: 'Access denied: You are not a member of this project' });
      }

      // Check role hierarchy (admin > member)
      if (requiredRole === 'admin' && member.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied: Project Admin role required' });
      }

      // Pass the project down to the request to save a DB call in the controller
      req.project = project;
      next();
    } catch (error) {
      next(error);
    }
  };
};
