import 'dotenv/config';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import {prisma } from '../libs/prisma.js';
import { createSchema, loginSchema,createSchemaSuper } from '../validations/auth.validation.js';

// Middleware to ensure only super admins can create admins or super admins
const ensureSuperAdmin = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }
};

// login user
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const { value, error } = await loginSchema.validateAsync({ email, password });

    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Bad Request',
        err: error.message,
        data: null,
      });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
        data: null,
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Wrong email or Password',
        data: null,
      });
    }

    const payload = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: '1d',
    });

    return res.status(200).json({
      success: true,
      message: 'Login success',
      data: token,
    });
  } catch (error) {
    next(error);
  }
};

// create user
const createUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const { value, error } = await createSchema.validateAsync({ name, email, password });

    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Bad Request',
        err: error.message,
        data: null,
      });
    }

    // Check if email is already in use
    const existingUser = await prisma.User.findUnique({
      where: { email }, // Use email as a unique identifier
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Email already in use',
        data: null,
      });
    }

    const encryptedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.User.create({
      data: {
        name,
        email,
        password: encryptedPassword,
        role: 'USER', // Set default role to 'USER'
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Created Successfully!',
      data: newUser,
    });
  } catch (error) {
    next(error);
  }
};


// create admin
const createAdmin = async (req, res, next) => {
  try {
    const { name,email, password } = req.body;

    const { value, error } = await createSchema.validateAsync({name, email, password });

    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Bad Request',
        err: error.message,
        data: null,
      });
    }

    const user = await prisma.User.findUnique({ where: { email } });

    if (user) {
      return res.status(404).json({
        success: false,
        message: 'User already exists',
        data: null,
      });
    }

    const encryptedPassword = await bcrypt.hash(password, 10);

    const newAdmin = await prisma.user.create({
      data: {
        name,
        email,
        password: encryptedPassword,
        role: 'ADMIN',
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Admin Created Successfully!',
      data: newAdmin,
    });
  } catch (error) {
    next(error);
  }
};

// create super admin
const createSuperAdmin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const { value, error } = await createSchemaSuper.validateAsync({ email, password });

    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Bad Request',
        err: error.message,
        data: null,
      });
    }

    const user = await prisma.User.findUnique({ where: { email } });

    if (user) {
      return res.status(404).json({
        success: false,
        message: 'User already exists',
        data: null,
      });
    }

    const encryptedPassword = await bcrypt.hash(password, 10);

    const newSuperAdmin = await prisma.User.create({
      data: {
        name:'saya SUPER ADMIN',
        email,
        password: encryptedPassword,
        role: 'SUPER_ADMIN',
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Super Admin Created Successfully!',
      data: newSuperAdmin,
    });
  } catch (error) {
    next(error);
  }
};

const getUserAll = async (req,res,next)=>{
  try {
    const users = await prisma.user.findMany();
    res.json(users);
} catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'An error occurred while fetching users' });
}

};

export {
  login,
  createUser,
  getUserAll,
  createAdmin,
  createSuperAdmin,
  ensureSuperAdmin
};