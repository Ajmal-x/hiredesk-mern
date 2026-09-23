import type { Request, Response } from 'express';
import { Notification } from '../models/Notification.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const listNotifications = asyncHandler(
  async (req: Request, res: Response) => {
    const notifications = await Notification.find({
      recipient: req.user!.id,
    })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    const unreadCount = await Notification.countDocuments({
      recipient: req.user!.id,
      read: false,
    });

    res.json({
      success: true,
      data: notifications,
      unreadCount,
    });
  },
);

export const markAsRead = asyncHandler(
  async (req: Request, res: Response) => {
    const notification = await Notification.findOneAndUpdate(
      {
        _id: req.params.id,
        recipient: req.user!.id,
      },
      {
        $set: { read: true },
      },
      {
        new: true,
      },
    );

    if (!notification) {
      throw ApiError.notFound('Notification not found');
    }

    res.json({
      success: true,
      data: notification,
    });
  },
);

export const markAllAsRead = asyncHandler(
  async (req: Request, res: Response) => {
    await Notification.updateMany(
      {
        recipient: req.user!.id,
        read: false,
      },
      {
        $set: { read: true },
      },
    );

    res.json({
      success: true,
      message: 'All notifications marked as read',
    });
  },
);

export const deleteNotification = asyncHandler(
  async (req: Request, res: Response) => {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      recipient: req.user!.id,
    });

    if (!notification) {
      throw ApiError.notFound('Notification not found');
    }

    res.json({
      success: true,
      message: 'Notification deleted',
    });
  },
);