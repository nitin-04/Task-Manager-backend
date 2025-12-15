import { Router, Request, Response, NextFunction } from 'express';
import * as AuthController from '../controllers/auth.controller';
import { RegisterSchema, LoginSchema } from '../schemas/auth.schema';
import { ZodType } from 'zod';

const router = Router();

const validate =
  (schema: ZodType<any, any, any>) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse({ body: req.body, query: req.query, params: req.params });
      next();
    } catch (e: any) {
      res.status(400).json(e.errors);
    }
  };

router.post('/register', validate(RegisterSchema), AuthController.register);
router.post('/login', validate(LoginSchema), AuthController.login);

export default router;
