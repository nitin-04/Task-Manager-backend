import mongoose, { Document, Schema } from 'mongoose';

export interface ITask extends Document {
  title: string;
  description?: string;
  status: 'To Do' | 'In Progress' | 'Completed';
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  dueDate?: Date;
  createdAt: Date;
}

const TaskSchema = new Schema(
  {
    title: { type: String, required: true },
    status: {
      type: String,
      enum: ['To Do', 'In Progress', 'Completed'],
      default: 'To Do',
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Urgent'],
      default: 'Low',
    },
    dueDate: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model<ITask>('Task', TaskSchema);
