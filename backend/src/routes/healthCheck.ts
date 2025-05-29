import { Router } from 'express';
import { healthCheck, readinessCheck, livenessCheck } from '../utils/healthCheck';

const router = Router();

/**
 * @route   GET /health
 * @desc    Health check endpoint
 * @access  Public
 */
router.get('/health', healthCheck);

/**
 * @route   GET /ready
 * @desc    Readiness check endpoint
 * @access  Public
 */
router.get('/ready', readinessCheck);

/**
 * @route   GET /live
 * @desc    Liveness check endpoint
 * @access  Public
 */
router.get('/live', livenessCheck);

export default router;
