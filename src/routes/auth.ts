import express from 'express';
import { registerUser, loginUser } from '../controllers';

const authRouter = express.Router();

authRouter.post('/register', registerUser);

authRouter.post('/login', loginUser);

export { authRouter };
