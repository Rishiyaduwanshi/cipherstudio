import { Router } from 'express';
import appResponse from '../utils/appResponse.js';

const router = Router();

router.get('/', (req, res) => {
  appResponse(res, {
    message: 'Welcome to the Home Route of the API',
    data: { status: 'OK' }
  });
});

router.get('/health', (req, res) => {
  appResponse(res, {
    message: 'Server is healthy',
    data: { status: 'UP' }
  });
});

export default router;