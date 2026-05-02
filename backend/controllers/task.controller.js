import Task from '../models/task.model.js';
import Project from '../models/project.model.js';

// @desc    Create a task in a project
// @route   POST /api/projects/:id/tasks
// @access  Private (Role: admin)
export const createTask = async (req, res, next) => {
  try {
    const { title, description, status, priority, dueDate, assignedTo, tags, attachments } = req.body;
    const project = req.project;

    let finalAssignedTo = assignedTo;
    if (finalAssignedTo === '') {
      finalAssignedTo = undefined;
    }

    // Validate that assignedTo (if provided) is a member of the project
    if (finalAssignedTo) {
      if (!finalAssignedTo.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(400).json({ message: 'Invalid assignedTo user ID' });
      }
      const isMember = project.isMember(finalAssignedTo);
      if (!isMember) {
        return res.status(400).json({ message: 'Assigned user must be a member of the project' });
      }
      if (project.isAdmin(finalAssignedTo)) {
        return res.status(400).json({ message: 'Tasks cannot be assigned to project admins' });
      }
    }

    // Calculate order: place new task at the end of its status column
    const targetStatus = status || 'todo';
    const lastTask = await Task.findOne({ project: project._id, status: targetStatus })
      .sort({ order: -1 })
      .select('order');
    const order = lastTask ? lastTask.order + 1 : 0;

    const task = await Task.create({
      title,
      description,
      status: targetStatus,
      priority,
      dueDate,
      assignedTo: finalAssignedTo,
      createdBy: req.user._id,
      project: project._id,
      order,
      tags,
      attachments,
      lastUpdatedBy: req.user._id,
      lastUpdatedAt: Date.now(),
    });

    // Update project lastActivityAt
    project.lastActivityAt = Date.now();
    await project.save();

    // Populate the response
    await task.populate([
      { path: 'assignedTo', select: 'name email avatar' },
      { path: 'createdBy', select: 'name email avatar' },
    ]);

    res.status(201).json(task);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all tasks for a project (with filtering)
// @route   GET /api/projects/:id/tasks
// @access  Private (Role: member)
export const getTasks = async (req, res, next) => {
  try {
    const project = req.project;
    const { status, priority, assignedTo } = req.query;

    const isAdmin = project.isAdmin(req.user._id);

    // Build filter object
    const filter = { project: project._id, isArchived: false };

    if (!isAdmin) {
      filter.assignedTo = req.user._id;
    }

    if (status && ['todo', 'inprogress', 'done'].includes(status)) {
      filter.status = status;
    }
    if (priority && ['low', 'medium', 'high'].includes(priority)) {
      filter.priority = priority;
    }
    if (assignedTo) {
      if (!assignedTo.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(400).json({ message: 'Invalid assignedTo filter' });
      }
      filter.assignedTo = assignedTo;
    }

    const tasks = await Task.find(filter)
      .sort({ status: 1, order: 1 })
      .populate('assignedTo', 'name email avatar')
      .populate('createdBy', 'name email avatar')
      .populate('lastUpdatedBy', 'name email avatar');

    res.status(200).json(tasks);
  } catch (error) {
    next(error);
  }
};

// @desc    Get tasks grouped by Kanban columns
// @route   GET /api/projects/:id/tasks/kanban
// @access  Private (Role: member)
export const getTasksKanban = async (req, res, next) => {
  try {
    const project = req.project;

    const isAdmin = project.isAdmin(req.user._id);
    const filter = { project: project._id, isArchived: false };

    if (!isAdmin) {
      filter.assignedTo = req.user._id;
    }

    const tasks = await Task.find(filter)
      .sort({ order: 1 })
      .populate('assignedTo', 'name email avatar')
      .populate('createdBy', 'name email avatar');

    // Group tasks into Kanban columns
    const kanban = {
      todo: tasks.filter((t) => t.status === 'todo'),
      inprogress: tasks.filter((t) => t.status === 'inprogress'),
      done: tasks.filter((t) => t.status === 'done'),
    };

    res.status(200).json(kanban);
  } catch (error) {
    next(error);
  }
};

// @desc    Update a task
// @route   PUT /api/projects/:id/tasks/:taskId
// @access  Private (Role: admin = all fields, member = status only on assigned tasks)
export const updateTask = async (req, res, next) => {
  try {
    const { taskId } = req.params;
    const project = req.project;

    // Validate taskId
    if (!taskId || !taskId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid Task ID' });
    }

    const task = await Task.findOne({ _id: taskId, project: project._id });

    if (!task) {
      return res.status(404).json({ message: 'Task not found in this project' });
    }

    // Determine user's role in the project
    const isAdmin = project.isAdmin(req.user._id);

    if (isAdmin) {
      // Admin can update everything EXCEPT status
      const { title, description, status, priority, dueDate, assignedTo, order, tags, attachments, isArchived } = req.body;

      if (status !== undefined) {
        return res.status(403).json({ message: 'Admins cannot update task status' });
      }

      if (title !== undefined) task.title = title;
      if (description !== undefined) task.description = description;
      if (priority !== undefined) task.priority = priority;
      if (dueDate !== undefined) task.dueDate = dueDate;
      if (order !== undefined) task.order = order;
      if (tags !== undefined) task.tags = tags;
      if (attachments !== undefined) task.attachments = attachments;
      if (isArchived !== undefined) task.isArchived = isArchived;

      // Validate assignedTo
      if (assignedTo !== undefined) {
        if (assignedTo === null || assignedTo === '') {
          task.assignedTo = undefined;
        } else {
          if (!assignedTo.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ message: 'Invalid assignedTo user ID' });
          }
          if (!project.isMember(assignedTo)) {
            return res.status(400).json({ message: 'Assigned user must be a member of the project' });
          }
          task.assignedTo = assignedTo;
        }
      }
    } else {
      // Member can ONLY update status on tasks assigned to them
      const isAssignedToUser = task.assignedTo && task.assignedTo.toString() === req.user._id.toString();

      if (!isAssignedToUser) {
        return res.status(403).json({ message: 'You can only update tasks assigned to you' });
      }

      const allowedFields = ['status'];
      const updates = Object.keys(req.body);
      const hasDisallowedFields = updates.some(field => !allowedFields.includes(field));

      if (hasDisallowedFields) {
        return res.status(403).json({ message: 'Members can only update the task status' });
      }

      const { status } = req.body;

      if (!status) {
        return res.status(400).json({ message: 'Status is required' });
      }

      if (!['todo', 'inprogress', 'done'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status value' });
      }

      task.status = status;
    }

    // Track activity
    task.lastUpdatedBy = req.user._id;
    task.lastUpdatedAt = Date.now();

    const updatedTask = await task.save();

    // Update project activity
    project.lastActivityAt = Date.now();
    await project.save();

    // Populate the response
    await updatedTask.populate([
      { path: 'assignedTo', select: 'name email avatar' },
      { path: 'createdBy', select: 'name email avatar' },
      { path: 'lastUpdatedBy', select: 'name email avatar' },
    ]);

    res.status(200).json(updatedTask);
  } catch (error) {
    next(error);
  }
};

// @desc    Reorder tasks within Kanban columns (drag-and-drop support)
// @route   PUT /api/projects/:id/tasks/reorder
// @access  Private (Role: member)
export const reorderTasks = async (req, res, next) => {
  try {
    const { tasks } = req.body;
    // tasks = [{ _id, status, order }, ...]

    if (!Array.isArray(tasks) || tasks.length === 0) {
      return res.status(400).json({ message: 'Tasks array is required for reordering' });
    }

    const project = req.project;

    // Batch update each task's status and order
    const bulkOps = tasks.map((t) => ({
      updateOne: {
        filter: { _id: t._id, project: project._id },
        update: {
          $set: {
            status: t.status,
            order: t.order,
            lastUpdatedBy: req.user._id,
            lastUpdatedAt: Date.now(),
          },
        },
      },
    }));

    await Task.bulkWrite(bulkOps);

    // Update project activity
    project.lastActivityAt = Date.now();
    await project.save();

    res.status(200).json({ message: 'Tasks reordered successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a task
// @route   DELETE /api/projects/:id/tasks/:taskId
// @access  Private (Role: admin)
export const deleteTask = async (req, res, next) => {
  try {
    const { taskId } = req.params;
    const project = req.project;

    // Validate taskId
    if (!taskId || !taskId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid Task ID' });
    }

    const task = await Task.findOne({ _id: taskId, project: project._id });

    if (!task) {
      return res.status(404).json({ message: 'Task not found in this project' });
    }

    await Task.deleteOne({ _id: task._id });

    // Update project activity
    project.lastActivityAt = Date.now();
    await project.save();

    res.status(200).json({ message: 'Task deleted successfully' });
  } catch (error) {
    next(error);
  }
};
