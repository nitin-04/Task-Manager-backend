import { Request, Response } from 'express';
import * as taskService from '../services/task.service';
import { io } from '../server';

export const create = async (req: Request, res: Response) => {
  try {
    // console.log(' Creating Task Payload:', req.body);

    const task = await taskService.createTask(req.body);

    console.log('💾 Saved to DB:', task);

    io.emit('taskCreated', task);
    res.status(201).json(task);
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ message: 'Error creating task' });
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
