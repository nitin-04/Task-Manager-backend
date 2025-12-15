import { Router, Request, Response, NextFunction } from 'express';
import * as TaskController from '../controllers/task.controller';
import { CreateTaskSchema } from '../schemas/task.schema';
import { ZodType } from 'zod';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

const validate =
  (schema: ZodType<any, any, any>) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse({ body: req.body, query: req.query, params: req.params });
      next();
    } catch (e: any) {
      res.status(400).send(e.errors);
    }
  };

router.post(
  '/',
  authenticateToken,
  validate(CreateTaskSchema),
  TaskController.create
);
router.get('/', TaskController.getAll);

router.patch('/:id', authenticateToken, TaskController.update);
router.delete('/:id', authenticateToken, TaskController.remove);

export default router;
