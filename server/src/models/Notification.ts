import mongoose, { Schema, type Document, type Model, type Types } from 'mongoose';

export const NOTIFICATION_TYPES = [
  'application',
  'status',
  'job',
  'system',
] as const;

export type NotificationType = (typeof NOTIFICATION_TYPES)[number];

export interface INotification extends Document {
  _id: Types.ObjectId;
  recipient: Types.ObjectId;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  link?: string;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    recipient: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    type: {
      type: String,
      enum: NOTIFICATION_TYPES,
      required: true,
      index: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },

    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },

    read: {
      type: Boolean,
      default: false,
      index: true,
    },

    link: {
      type: String,
      trim: true,
      maxlength: 500,
    },
  },
  { timestamps: true },
);

// Fast notification list for each user, newest first.
notificationSchema.index({ recipient: 1, createdAt: -1 });

// Fast unread count.
notificationSchema.index({ recipient: 1, read: 1 });

export const Notification: Model<INotification> =
  mongoose.models.Notification ??
  mongoose.model<INotification>('Notification', notificationSchema);