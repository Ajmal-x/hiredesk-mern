import { Router } from 'express';
import * as notificationController from '../controllers/notification.controller.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.get('/', requireAuth, notificationController.listNotifications);

router.patch(
  '/read-all',
  requireAuth,
  notificationController.markAllAsRead,
);

router.patch(
  '/:id/read',
  requireAuth,
  notificationController.markAsRead,
);

router.delete(
  '/:id',
  requireAuth,
  notificationController.deleteNotification,
);

export default router;