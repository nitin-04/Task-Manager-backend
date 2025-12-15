import express from 'express';
import http from 'http';
import { connectDB } from './config/db';
import { Server } from 'socket.io';

import cors from 'cors';
import dotenv from 'dotenv';

import taskRoutes from '../src/routes/task.routes';
import authRoutes from '../src/routes/auth.routes';

dotenv.config();
const app = express();
const server = http.createServer(app);

connectDB();

export const io = new Server(server, {
  cors: { origin: '*' },
});

app.use(cors());
app.use(express.json());

app.use('/tasks', taskRoutes);
app.use('/auth', authRoutes);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
