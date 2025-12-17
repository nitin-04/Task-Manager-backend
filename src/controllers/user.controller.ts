import { Request, Response } from 'express';
import User from '../models/User';

export const getAllUsers = async (req: Request, res: Response) => {
  // console.log('Request received for /users');

  try {
    // console.log(' Attempting to find users in DB...');

    const users = await User.find().select('name email _id');

    // console.log(` Found ${users.length} users. Sending response...`);

    return res.status(200).json(users);
  } catch (error) {
    // console.error(' Error in getAllUsers:', error);
    return res.status(500).json({ message: 'Error fetching users' });
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const { name } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user?.userId,
      { name },
      { new: true }
    ).select('-passwordHash');

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error updating profile' });
  }
};
