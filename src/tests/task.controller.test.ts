import { create } from '../controllers/task.controller';
import * as taskService from '../services/task.service';
import Notification from '../models/Notification';
import { Request, Response } from 'express';

//  MOCK DEPENDENCIES
// We don't want to use the real DB or Socket.io
jest.mock('../services/task.service');
jest.mock('../models/Notification');
jest.mock('../server', () => ({
  io: { emit: jest.fn() }, // Mock Socket.io emit function
}));

describe('Task Controller - Create Task', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks(); // Clear previous test data

    // Setup Mock Request/Response
    jsonMock = jest.fn();
    statusMock = jest.fn().mockReturnValue({ json: jsonMock });
    res = {
      status: statusMock,
      json: jsonMock,
    };
    req = {
      body: {},
      user: { userId: 'creator-id-123' }, // Mock logged-in user
    } as any;
  });

  // TEST 1: Sanitize Data (Filter out empty strings)
  it('should sanitize "assignedTo" by removing empty strings', async () => {
    // Input: One valid ID, one empty string
    req.body = {
      title: 'Test Task',
      assignedTo: ['valid-user-id', ''],
    };

    // Mock Service Response
    (taskService.createTask as jest.Mock).mockResolvedValue({
      _id: 'task-123',
      title: 'Test Task',
      assignedTo: ['valid-user-id'], // Service returns cleaned array
      creatorId: 'creator-id-123',
    });

    await create(req as Request, res as Response);

    // Assert: The service was called with the CLEANED array (no empty string)
    expect(taskService.createTask).toHaveBeenCalledWith(
      expect.objectContaining({
        assignedTo: ['valid-user-id'],
      })
    );

    // Assert: Returns 201 Created
    expect(statusMock).toHaveBeenCalledWith(201);
  });

  //  TEST 2: Notification Logic (Exclude Creator)
  it('should NOT send a notification if the assignee is the creator', async () => {
    req.body = {
      title: 'Self Assigned Task',
      assignedTo: ['creator-id-123'], // Assigning to SELF
    };

    // Mock Service Response
    (taskService.createTask as jest.Mock).mockResolvedValue({
      title: 'Self Assigned Task',
      assignedTo: ['creator-id-123'],
      creatorId: 'creator-id-123',
    });

    await create(req as Request, res as Response);

    // Assert: Notification.create should NOT be called
    expect(Notification.create).not.toHaveBeenCalled();
  });

  // ✅ TEST 3: Notification Logic (Success Case)
  it('should send a notification when assigning SOMEONE ELSE', async () => {
    req.body = {
      title: 'Work for Bob',
      assignedTo: ['other-user-456'], // Assigning to SOMEONE ELSE
    };

    (taskService.createTask as jest.Mock).mockResolvedValue({
      title: 'Work for Bob',
      assignedTo: ['other-user-456'],
      creatorId: 'creator-id-123',
    });

    await create(req as Request, res as Response);

    // Assert: Notification.create WAS called for the other user
    expect(Notification.create).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'other-user-456',
        message: expect.stringContaining('You were assigned'),
      })
    );
  });
});
