import mongoose from 'mongoose';
import Project from '../models/project.model.js';
import Task from '../models/task.model.js';

// @desc    Get dashboard analytics for the logged-in user (GLOBAL)
// @route   GET /api/dashboard
// @access  Private
export const getDashboard = async (req, res, next) => {
  try {
    const userId = req.user._id;
    console.log('[GlobalDashboard] req.user:', userId);

    // Step 1: Get all projects where user is a member
    const userProjects = await Project.find({ 'members.user': userId }).select('_id members');
    
    const adminProjectIds = [];
    const memberProjectIds = [];
    
    userProjects.forEach(p => {
      const isAd = p.members.some(m => m.user.toString() === userId.toString() && m.role === 'admin');
      if (isAd) adminProjectIds.push(p._id);
      else memberProjectIds.push(p._id);
    });

    const projectIds = [...adminProjectIds, ...memberProjectIds];

    if (projectIds.length === 0) {
      return res.status(200).json({
        totalTasks: 0,
        statusStats: { todo: 0, inprogress: 0, done: 0 },
        priorityStats: { low: 0, medium: 0, high: 0 },
        overdueTasks: 0,
        tasksPerUser: [],
        recentActivity: [],
      });
    }

    // Step 2: Run all aggregations in parallel for performance
    const [statusAgg, priorityAgg, overdueAgg, tasksPerUserAgg, recentActivity, projectProgressAgg] = await Promise.all([
      Task.aggregate([
        { 
          $match: { 
            isArchived: false,
            $or: [
              { project: { $in: adminProjectIds } },
              { project: { $in: memberProjectIds }, assignedTo: userId }
            ]
          } 
        },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      Task.aggregate([
        { 
          $match: { 
            isArchived: false,
            $or: [
              { project: { $in: adminProjectIds } },
              { project: { $in: memberProjectIds }, assignedTo: userId }
            ]
          } 
        },
        { $group: { _id: '$priority', count: { $sum: 1 } } },
      ]),
      Task.aggregate([
        {
          $match: {
            isArchived: false,
            $or: [
              { project: { $in: adminProjectIds } },
              { project: { $in: memberProjectIds }, assignedTo: userId }
            ],
            status: { $ne: 'done' },
            dueDate: { $lt: new Date(), $ne: null },
          },
        },
        { $count: 'count' },
      ]),
      Task.aggregate([
        {
          $match: {
            $or: [
              { project: { $in: adminProjectIds } },
              { project: { $in: memberProjectIds }, assignedTo: userId }
            ],
            isArchived: false,
            assignedTo: { $ne: null },
          },
        },
        {
          $group: {
            _id: '$assignedTo',
            total: { $sum: 1 },
            completed: {
              $sum: { $cond: [{ $eq: ['$status', 'done'] }, 1, 0] },
            },
          },
        },
        {
          $lookup: {
            from: 'users',
            localField: '_id',
            foreignField: '_id',
            as: 'userInfo',
          },
        },
        { $unwind: '$userInfo' },
        {
          $project: {
            _id: 0,
            userId: '$_id',
            name: '$userInfo.name',
            email: '$userInfo.email',
            avatar: '$userInfo.avatar',
            total: 1,
            completed: 1,
            completionRate: {
              $round: [
                { $multiply: [{ $divide: ['$completed', '$total'] }, 100] },
                0,
              ],
            },
          },
        },
        { $sort: { total: -1 } },
      ]),
      Task.aggregate([
        { 
          $match: { 
            isArchived: false,
            $or: [
              { project: { $in: adminProjectIds } },
              { project: { $in: memberProjectIds }, assignedTo: userId }
            ]
          } 
        },
        { $sort: { updatedAt: -1 } },
        { $limit: 10 },
        {
          $lookup: {
            from: 'projects',
            localField: 'project',
            foreignField: '_id',
            as: 'projectInfo',
          },
        },
        { $unwind: '$projectInfo' },
        {
          $project: {
            _id: 1,
            title: 1,
            status: 1,
            priority: 1,
            project: '$projectInfo.name',
            projectColor: '$projectInfo.color',
            updatedAt: 1,
          },
        },
      ]),
      Task.aggregate([
        { $match: { project: { $in: projectIds }, isArchived: false } },
        { 
          $group: { 
            _id: null, 
            total: { $sum: 1 }, 
            completed: { $sum: { $cond: [{ $eq: ['$status', 'done'] }, 1, 0] } } 
          } 
        }
      ])
    ]);

    const statusStats = { todo: 0, inprogress: 0, done: 0 };
    statusAgg.forEach((s) => {
      if (statusStats.hasOwnProperty(s._id)) {
        statusStats[s._id] = s.count;
      }
    });

    const priorityStats = { low: 0, medium: 0, high: 0 };
    priorityAgg.forEach((p) => {
      if (priorityStats.hasOwnProperty(p._id)) {
        priorityStats[p._id] = p.count;
      }
    });

    const totalTasks = statusStats.todo + statusStats.inprogress + statusStats.done;
    const overdueTasks = overdueAgg.length > 0 ? overdueAgg[0].count : 0;

    let projectProgress = 0;
    if (projectProgressAgg.length > 0 && projectProgressAgg[0].total > 0) {
      projectProgress = Math.round((projectProgressAgg[0].completed / projectProgressAgg[0].total) * 100);
    }

    console.log('[GlobalDashboard] totalTasks:', totalTasks);

    res.status(200).json({
      role: adminProjectIds.length > 0 ? 'admin' : 'member',
      totalTasks,
      statusStats,
      priorityStats,
      overdueTasks,
      projectProgress,
      tasksPerUser: tasksPerUserAgg,
      recentActivity,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get dashboard analytics for a specific project
// @route   GET /api/dashboard/project/:projectId
// @access  Private
export const getProjectDashboard = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const project = req.project;
    const projectId = project._id;

    // Debug logging
    console.log('[ProjectDashboard] req.user:', userId);
    console.log('[ProjectDashboard] projectId:', projectId);

    const isAdmin = project.isAdmin(userId);
    
    // Determine the match filter based on role for THIS project
    const roleMatch = { project: projectId, isArchived: false };
    if (!isAdmin) {
      roleMatch.assignedTo = userId;
    }

    // Step 2: Run all aggregations in parallel for performance
    const [statusAgg, priorityAgg, overdueAgg, tasksPerUserAgg, recentActivity, projectProgressAgg] = await Promise.all([
      Task.aggregate([
        { $match: roleMatch },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      Task.aggregate([
        { $match: roleMatch },
        { $group: { _id: '$priority', count: { $sum: 1 } } },
      ]),
      Task.aggregate([
        {
          $match: {
            ...roleMatch,
            status: { $ne: 'done' },
            dueDate: { $lt: new Date(), $ne: null },
          },
        },
        { $count: 'count' },
      ]),
      Task.aggregate([
        {
          $match: {
            ...roleMatch,
            assignedTo: { $ne: null },
          },
        },
        {
          $group: {
            _id: '$assignedTo',
            total: { $sum: 1 },
            completed: {
              $sum: { $cond: [{ $eq: ['$status', 'done'] }, 1, 0] },
            },
          },
        },
        {
          $lookup: {
            from: 'users',
            localField: '_id',
            foreignField: '_id',
            as: 'userInfo',
          },
        },
        { $unwind: '$userInfo' },
        {
          $project: {
            _id: 0,
            userId: '$_id',
            name: '$userInfo.name',
            email: '$userInfo.email',
            avatar: '$userInfo.avatar',
            total: 1,
            completed: 1,
            completionRate: {
              $round: [
                { $multiply: [{ $divide: ['$completed', '$total'] }, 100] },
                0,
              ],
            },
          },
        },
        { $sort: { total: -1 } },
      ]),
      Task.aggregate([
        { $match: roleMatch },
        { $sort: { updatedAt: -1 } },
        { $limit: 10 },
        {
          $lookup: {
            from: 'projects',
            localField: 'project',
            foreignField: '_id',
            as: 'projectInfo',
          },
        },
        { $unwind: '$projectInfo' },
        {
          $project: {
            _id: 1,
            title: 1,
            status: 1,
            priority: 1,
            project: '$projectInfo.name',
            projectColor: '$projectInfo.color',
            updatedAt: 1,
          },
        },
      ]),
      Task.aggregate([
        { $match: roleMatch },
        { 
          $group: { 
            _id: null, 
            total: { $sum: 1 }, 
            completed: { $sum: { $cond: [{ $eq: ['$status', 'done'] }, 1, 0] } } 
          } 
        }
      ])
    ]);

    const statusStats = { todo: 0, inprogress: 0, done: 0 };
    statusAgg.forEach((s) => {
      if (statusStats.hasOwnProperty(s._id)) {
        statusStats[s._id] = s.count;
      }
    });

    const priorityStats = { low: 0, medium: 0, high: 0 };
    priorityAgg.forEach((p) => {
      if (priorityStats.hasOwnProperty(p._id)) {
        priorityStats[p._id] = p.count;
      }
    });

    const totalTasks = statusStats.todo + statusStats.inprogress + statusStats.done;
    const overdueTasks = overdueAgg.length > 0 ? overdueAgg[0].count : 0;

    let projectProgress = 0;
    if (projectProgressAgg.length > 0 && projectProgressAgg[0].total > 0) {
      projectProgress = Math.round((projectProgressAgg[0].completed / projectProgressAgg[0].total) * 100);
    }

    console.log('[ProjectDashboard] totalTasks:', totalTasks);

    res.status(200).json({
      role: isAdmin ? 'admin' : 'member',
      totalTasks,
      statusStats,
      priorityStats,
      overdueTasks,
      projectProgress,
      tasksPerUser: tasksPerUserAgg,
      recentActivity,
    });
  } catch (error) {
    console.error('Project Dashboard Error:', error);
    next(error);
  }
};
