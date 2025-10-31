import { Router } from 'express';
import portfolios from './portfolios.routes';

const router = Router();

router.use('/', portfolios); 

export default router;
