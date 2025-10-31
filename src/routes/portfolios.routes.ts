import { Router } from 'express';
import {
  getAllPortfolios,
  getPortfolioById,
  createPortfolio,
  updatePortfolio,
  deletePortfolio,
} from '../controllers/portfolios.controller';

const router = Router();

// GET routes
router.get('/portfolios', getAllPortfolios);
router.get('/portfolios/:id', getPortfolioById);

// POST routes
router.post('/portfolios', createPortfolio);

// PUT routes
router.put('/portfolios/:id', updatePortfolio);

// DELETE routes
router.delete('/portfolios/:id', deletePortfolio);

export default router;
