import bcrypt from 'bcryptjs';
import prisma from '../utils/db.js';

/**
 * Builds avatar initials from first and last name.
 */
const buildInitials = (firstName = '', lastName = '') => {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || 'U';
};

/**
 * Returns safe user data without password_hash.
 */
const formatUser = (user) => ({
  id: user.id,
  first_name: user.first_name,
  last_name: user.last_name,
  name: `${user.first_name} ${user.last_name}`,
  email: user.email,
  avatar_initials: user.avatar_initials,
  status: user.status,
  last_login_at: user.last_login_at,
  role_id: user.role_id,
  role: user.role?.role_name || 'Staff',
  permissions: user.role
    ? {
        can_manage_leads: user.role.can_manage_leads,
        can_send_email: user.role.can_send_email,
        can_manage_users: user.role.can_manage_users,
        can_manage_settings: user.role.can_manage_settings,
      }
    : {},
});

/**
 * GET /api/users
 * Admin-only: list all users with their roles.
 */
export const getUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { created_at: 'desc' },
      include: { role: true },
    });

    return res.json(users.map(formatUser));
  } catch (err) {
    console.error('Get users error:', err);
    return res.status(500).json({ error: 'Failed to load users.' });
  }
};

/**
 * GET /api/users/roles
 * Admin-only: list available roles for dropdowns.
 */
export const getRoles = async (req, res) => {
  try {
    const roles = await prisma.role.findMany({
      orderBy: { role_name: 'asc' },
    });

    return res.json(roles);
  } catch (err) {
    console.error('Get roles error:', err);
    return res.status(500).json({ error: 'Failed to load roles.' });
  }
};

/**
 * POST /api/users
 * Admin-only: create Admin or Staff account.
 */
export const createUser = async (req, res) => {
  const {
    first_name,
    last_name,
    email,
    password,
    role_id,
    status = 'active',
  } = req.body;

  if (!first_name || !last_name || !email || !password || !role_id) {
    return res.status(400).json({
      error: 'First name, last name, email, password, and role are required.',
    });
  }

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(409).json({ error: 'Email is already registered.' });
    }

    const selectedRole = await prisma.role.findUnique({
      where: { id: Number(role_id) },
    });

    if (!selectedRole) {
      return res.status(404).json({ error: 'Selected role was not found.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        first_name,
        last_name,
        email,
        password_hash: passwordHash,
        avatar_initials: buildInitials(first_name, last_name),
        status,
        role_id: Number(role_id),
      },
      include: { role: true },
    });

    return res.status(201).json(formatUser(user));
  } catch (err) {
    console.error('Create user error:', err);
    return res.status(500).json({ error: 'Failed to create user.' });
  }
};

/**
 * PATCH /api/users/:id
 * Admin-only: update user role or status.
 */
export const updateUser = async (req, res) => {
  const userId = Number(req.params.id);
  const { role_id, status } = req.body;

  if (!userId) {
    return res.status(400).json({ error: 'Invalid user ID.' });
  }

  try {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(role_id ? { role_id: Number(role_id) } : {}),
        ...(status ? { status } : {}),
      },
      include: { role: true },
    });

    return res.json(formatUser(updatedUser));
  } catch (err) {
    console.error('Update user error:', err);
    return res.status(500).json({ error: 'Failed to update user.' });
  }
};