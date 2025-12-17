import { Request, Response } from 'express';
import * as taskService from '../services/task.service';
import { io } from '../server';
import Notification from '../models/Notification';

export const create = async (req: Request, res: Response) => {
  try {
    //  Sanitize assignedTo
    let assigneesList = req.body.assignedTo || [];
    if (typeof assigneesList === 'string') {
      assigneesList = [assigneesList];
    }
    assigneesList = assigneesList.filter((id: string) => id && id !== '');

    const taskData = {
      ...req.body,
      assignedTo: assigneesList.length > 0 ? assigneesList : undefined,
      creatorId: req.user?.userId,
    };

    const task = await taskService.createTask(taskData);
    // console.log(' Saved to DB:', task);

    io.emit('taskCreated', task);

    const taskAssignees = task.assignedTo as any;

    if (taskAssignees && taskAssignees.length > 0) {
      // Use Promise.all to ensure we wait for DB saves without blocking response too long
      await Promise.all(
        taskAssignees.map(async (userId: any) => {
          if (userId.toString() === req.user?.userId) {
            return;
          }

          const message = `You were assigned to "${task.title}"`;

          io.emit('notification', { userId, message });

          await Notification.create({ userId, message });
        })
      );
    }

    res.status(201).json(task);
  } catch (error: any) {
    // console.error(' Error creating task:', error);
    res
      .status(500)
      .json({ message: 'Error creating task', error: error.message });
  }
};

export const getAll = async (req: Request, res: Response) => {
  try {
    const filters = {
      status: req.query.status as string,
      priority: req.query.priority as string,
    };
    const tasks = await taskService.getAllTasks(filters);
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching tasks' });
  }
};

export const update = async (req: Request, res: Response) => {
  try {
    const updatedTask = await taskService.updateTask(req.params.id, req.body);
    if (!updatedTask)
      return res.status(404).json({ message: 'Task not found' });

    io.emit('taskUpdated', updatedTask);

    // Notification Logic for Updates
    if (req.body.assignedTo && Array.isArray(req.body.assignedTo)) {
      await Promise.all(
        req.body.assignedTo.map(async (userId: string) => {
          if (userId.toString() === req.user?.userId) return;

          const message = `You were assigned to "${updatedTask.title}"`;

          io.emit('notification', { userId, message });
          await Notification.create({ userId, message });
        })
      );
    }

    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ message: 'Error updating task' });
  }
};

export const remove = async (req: Request, res: Response) => {
  try {
    const deletedTask = await taskService.deleteTask(req.params.id);
    if (!deletedTask)
      return res.status(404).json({ message: 'Task not found' });

    io.emit('taskDeleted', req.params.id);
    res.json({ message: 'Task deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting task' });
  }
};
