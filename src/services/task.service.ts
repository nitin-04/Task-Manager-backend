import Task, { ITask } from '../models/Task';

export const createTask = async (data: Partial<ITask>): Promise<ITask> => {
  return await Task.create(data);
};

export const getAllTasks = async (filters: any): Promise<ITask[]> => {
  const query: any = {};

  if (filters.status && filters.status !== '') {
    query.status = filters.status;
  }

  if (filters.priority && filters.priority !== '') {
    query.priority = filters.priority;
  }

  // console.log('🔍 MongoDB Query Object:', query);

  return await Task.find(query).sort({ createdAt: -1 });
};

export const updateTask = async (
  id: string,
  updates: Partial<ITask>
): Promise<ITask | null> => {
  return await Task.findByIdAndUpdate(id, updates, { new: true });
};

export const deleteTask = async (id: string): Promise<ITask | null> => {
  return await Task.findByIdAndDelete(id);
};
