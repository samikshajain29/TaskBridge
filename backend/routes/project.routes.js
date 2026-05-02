import express from 'express';
import {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
  addMember,
  removeMember,
} from '../controllers/project.controller.js';
import {
  createTask,
  getTasks,
  getTasksKanban,
  updateTask,
  reorderTasks,
  deleteTask,
} from '../controllers/task.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { checkProjectRole } from '../middleware/role.middleware.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// ==========================================
// Project Routes
// ==========================================
router.route('/')
  .get(getProjects)
  .post(createProject);

router.route('/:id')
  .get(checkProjectRole('member'), getProjectById)
  .put(checkProjectRole('admin'), updateProject)
  .delete(checkProjectRole('admin'), deleteProject);

router.route('/:id/members')
  .post(checkProjectRole('admin'), addMember);

router.route('/:id/members/:userId')
  .delete(checkProjectRole('admin'), removeMember);

// ==========================================
// Task Routes (nested under projects)
// ==========================================
router.get('/:id/tasks/kanban', checkProjectRole('member'), getTasksKanban);
router.put('/:id/tasks/reorder', checkProjectRole('member'), reorderTasks);

router.route('/:id/tasks')
  .get(checkProjectRole('member'), getTasks)
  .post(checkProjectRole('admin'), createTask);

router.route('/:id/tasks/:taskId')
  .put(checkProjectRole('member'), updateTask)
  .delete(checkProjectRole('admin'), deleteTask);

export default router;
