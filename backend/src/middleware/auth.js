import jwt from 'jsonwebtoken';
import prisma from '../utils/db.js';

export const getRoleName = (user) => {
  return user?.role?.role_name?.toLowerCase() || '';
};

export const isAdminUser = (user) => {
  return getRoleName(user) === 'admin';
};

export const requireAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'Authorization token missing or invalid.',
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'temporary_signing_secret_for_jwt_leadflow'
    );

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: { role: true },
    });

    if (!user || user.status !== 'active') {
      return res.status(403).json({
        error: 'User account is inactive or invalid.',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      error: 'Session expired or invalid token.',
    });
  }
};

export const requirePermission = (permissionKey) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role || !req.user.role[permissionKey]) {
      return res.status(403).json({
        error: 'You do not have permission to execute this action.',
      });
    }

    next();
  };
};

export const requireAdmin = (req, res, next) => {
  if (!isAdminUser(req.user)) {
    return res.status(403).json({
      error: 'Admin access only.',
    });
  }

  next();
};