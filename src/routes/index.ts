import { Router } from 'express';
import { loginUser, registerUser, getCandleStickData } from '../controllers';
import { candleStickReqValidator } from '../validators';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.get('/:symbol/getCandleStickData', authenticateToken, candleStickReqValidator, getCandleStickData)
router.post('/register', registerUser);
router.post('/login', loginUser);
export default router;
