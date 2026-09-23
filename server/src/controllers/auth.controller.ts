import fs from 'node:fs/promises';
import path from 'node:path';

import type { Request, Response } from 'express';

import { User } from '../models/User.js';
import { UPLOAD_DIR } from '../middleware/upload.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import {
  REFRESH_COOKIE,
  clearRefreshCookie,
  setRefreshCookie,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from '../utils/tokens.js';

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password, role, company } = req.body;

  if (await User.exists({ email })) {
    throw ApiError.conflict('An account with that email already exists');
  }

  const user = await User.create({ name, email, password, role, company });
  const payload = { sub: user._id.toString(), role: user.role };

  setRefreshCookie(res, signRefreshToken(payload));

  res.status(201).json({
    success: true,
    data: {
      user: user.toJSON(),
      accessToken: signAccessToken(payload),
    },
  });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.comparePassword(password))) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  const payload = {
    sub: user._id.toString(),
    role: user.role,
  };

  setRefreshCookie(res, signRefreshToken(payload));

  res.json({
    success: true,
    data: {
      user: user.toJSON(),
      accessToken: signAccessToken(payload),
    },
  });
});

export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const token = req.cookies?.[REFRESH_COOKIE];

  if (!token) {
    throw ApiError.unauthorized('No refresh token provided');
  }

  let payload;

  try {
    payload = verifyRefreshToken(token);
  } catch {
    throw ApiError.unauthorized('Refresh token is invalid or expired');
  }

  const user = await User.findById(payload.sub);

  if (!user) {
    throw ApiError.unauthorized('Account no longer exists');
  }

  const next = {
    sub: user._id.toString(),
    role: user.role,
  };

  setRefreshCookie(res, signRefreshToken(next));

  res.json({
    success: true,
    data: {
      user: user.toJSON(),
      accessToken: signAccessToken(next),
    },
  });
});

export const logout = asyncHandler(async (_req: Request, res: Response) => {
  clearRefreshCookie(res);

  res.json({
    success: true,
    message: 'Logged out',
  });
});

export const me = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(req.user!.id);

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  res.json({
    success: true,
    data: user.toJSON(),
  });
});

export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findByIdAndUpdate(req.user!.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  res.json({
    success: true,
    data: user.toJSON(),
  });
});

export const uploadProfileResume = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.file) {
      throw ApiError.badRequest('Please upload a resume');
    }

    const user = await User.findById(req.user!.id);

    if (!user) {
      await fs.unlink(req.file.path).catch(() => {});
      throw ApiError.notFound('User not found');
    }

    const previousResumeUrl = user.resumeUrl;

    user.resumeUrl = `/uploads/${req.file.filename}`;

    await user.save();

    if (previousResumeUrl) {
      const previousFilename = path.basename(previousResumeUrl);
      const previousPath = path.join(UPLOAD_DIR, previousFilename);

      if (previousPath !== req.file.path) {
        await fs.unlink(previousPath).catch(() => {});
      }
    }

    res.json({
      success: true,
      data: user.toJSON(),
    });
  },
);

export const deleteProfileResume = asyncHandler(
  async (req: Request, res: Response) => {
    const user = await User.findById(req.user!.id);

    if (!user) {
      throw ApiError.notFound('User not found');
    }

    if (user.resumeUrl) {
      const filename = path.basename(user.resumeUrl);
      const filePath = path.join(UPLOAD_DIR, filename);

      await fs.unlink(filePath).catch(() => {});
    }

    user.resumeUrl = undefined;

    await user.save();

    res.json({
      success: true,
      data: user.toJSON(),
    });
  },
);