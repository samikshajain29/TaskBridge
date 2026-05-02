import express from 'express';
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

const router = express.Router({ mergeParams: true }); // mergeParams to access :id from parent route

// All task routes require authentication
router.use(protect);

// Kanban view (must be ABOVE /:taskId to avoid route conflict)
router.get('/kanban', checkProjectRole('member'), getTasksKanban);

// Reorder tasks (drag-and-drop) — any project member can reorder
router.put('/reorder', checkProjectRole('member'), reorderTasks);

// CRUD routes
router.route('/')
  .get(checkProjectRole('member'), getTasks)      // Members can list tasks
  .post(checkProjectRole('admin'), createTask);    // Only admins can create

router.route('/:taskId')
  .put(checkProjectRole('member'), updateTask)     // Members update status; admins update all
  .delete(checkProjectRole('admin'), deleteTask);  // Only admins can delete

export default router;
