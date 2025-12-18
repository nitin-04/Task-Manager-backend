import * as taskService from '../services/task.service';
import Task from '../models/Task';

//  MOCK MONGOOSE MODEL
jest.mock('../models/Task');

describe('Task Service - Business Logic', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  //  TEST 1: Create Task (Database Interaction)
  it('should call Task.create with correct data', async () => {
    //  FIX: Cast to 'any' to bypass ObjectId strict check
    const mockTaskData = {
      title: 'New Service Task',
      creatorId: 'user-123',
    } as any;
    const mockSavedTask = { _id: 'task-db-1', ...mockTaskData };

    // Mock the Mongoose .create() method
    (Task.create as jest.Mock).mockResolvedValue(mockSavedTask);

    const result = await taskService.createTask(mockTaskData);

    expect(Task.create).toHaveBeenCalledWith(mockTaskData);
    expect(result).toEqual(mockSavedTask);
  });

  //  TEST 2: Get All Tasks (Filtering Logic)
  it('should build a query based on provided filters', async () => {
    const filters = { status: 'To Do', priority: 'High' };
    const mockTasks = [{ title: 'Task A', status: 'To Do', priority: 'High' }];

    // Mock the chain: Task.find().sort()
    const mockSort = jest.fn().mockResolvedValue(mockTasks);
    (Task.find as jest.Mock).mockReturnValue({ sort: mockSort });

    await taskService.getAllTasks(filters);

    // Verify it queried with the filters we passed
    expect(Task.find).toHaveBeenCalledWith(filters);
  });

  //  TEST 3: Update Task (Handling IDs)
  it('should find and update a task by ID', async () => {
    const taskId = 'task-123';
    // 👇 FIX: Cast to 'any' or use 'as const' to satisfy the Enum type
    const updates = { status: 'Completed' } as any;
    const mockUpdatedTask = { _id: taskId, ...updates };

    // Mock findByIdAndUpdate
    (Task.findByIdAndUpdate as jest.Mock).mockResolvedValue(mockUpdatedTask);

    const result = await taskService.updateTask(taskId, updates);

    expect(Task.findByIdAndUpdate).toHaveBeenCalledWith(taskId, updates, {
      new: true,
    });
    expect(result).toEqual(mockUpdatedTask);
  });
});
