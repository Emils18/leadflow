import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../utils/db.js';

export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required fields.' });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      include: { role: true }
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid login credentials.' });
    }

    if (user.status !== 'active') {
      return res.status(403).json({ error: 'Your account has been deactivated.' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid login credentials.' });
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role.role_name },
      process.env.JWT_SECRET || 'temporary_signing_secret_for_jwt_leadflow',
      { expiresIn: '8h' }
    );

    await prisma.user.update({
      where: { id: user.id },
      data: { last_login_at: new Date() }
    });

    return res.json({
      token,
      user: {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        avatar_initials: user.avatar_initials,
        role: {
          role_name: user.role.role_name,
          can_manage_leads: user.role.can_manage_leads,
          can_send_email: user.role.can_send_email,
        }
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Internal server error during authentication.' });
  }
};

export const getSession = async (req, res) => {
  try {
    const { id, first_name, last_name, email, avatar_initials, role } = req.user;
    return res.json({
      user: {
        id,
        first_name,
        last_name,
        email,
        avatar_initials,
        role: {
          role_name: role.role_name,
          can_manage_leads: role.can_manage_leads,
          can_send_email: role.can_send_email,
        }
      }
    });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to retrieve session context.' });
  }
};