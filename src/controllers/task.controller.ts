import { Request, Response } from 'express';
import * as taskService from '../services/task.service';
import { io } from '../server';

export const create = async (req: Request, res: Response) => {
  try {
    const assignedTo =
      req.body.assignedTo && req.body.assignedTo !== ''
        ? req.body.assignedTo
        : undefined;

    const taskData = {
      ...req.body,
      assignedTo: assignedTo,
      creatorId: req.user?.userId,
    };

    const task = await taskService.createTask(taskData);

    console.log('💾 Saved to DB:', task);

    io.emit('taskCreated', task);

    if (task.assignedTo) {
      io.emit('notification', {
        userId: task.assignedTo,
        message: `You were assigned to "${task.title}"`,
      });
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
    // console.log(' API Request Query:', req.query);

    const filters = {
      status: req.query.status as string,
      priority: req.query.priority as string,
    };

    const tasks = await taskService.getAllTasks(filters);
    res.json(tasks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching tasks' });
  }
};

export const update = async (req: Request, res: Response) => {
  try {
    const updatedTask = await taskService.updateTask(req.params.id, req.body);
    if (!updatedTask)
      return res.status(404).json({ message: 'Task not found' });

    io.emit('taskUpdated', updatedTask);

    if (req.body.assignedTo) {
      io.emit('notification', {
        userId: req.body.assignedTo,
        message: `You were assigned to "${updatedTask.title}"`,
      });
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
