import 'dotenv/config';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import {prisma } from '../libs/prisma.js';
import { createSchema, loginSchema,createSchemaSuper } from '../validations/auth.validation.js';


// Helper
const generateTokens = (user) => {
  const accessToken = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
  const refreshToken = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_REFRESH_SECRET, { expiresIn: '1d' });
  return { accessToken, refreshToken };
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
        message: 'User Tidak di temukan',
        data: null,
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Email atau password salah',
        data: null,
      });
    }

    const { accessToken, refreshToken } = generateTokens(user);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000
    });

    return res.status(200).json({
      success: true,
      message: 'Login success',
      data: accessToken,
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
      where: { email }, 
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Email Sudah di gunakan',
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
      message: 'Berhasil membuat akun',
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
        message: 'Admin sudah ada!',
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
      message: 'Admin Berhasil dibuat!',
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
        message: 'Super admin sudah ada',
        data: null,
      });
    }

    const encryptedPassword = await bcrypt.hash(password, 10);

    const newSuperAdmin = await prisma.User.create({
      data: {
        name:'SUPER ADMIN',
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

// Who I Am
const getMe = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, role: true, createdAt: true, updatedAt: true } 
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User tidak ada' });
    }

    return res.status(200).json({
      success: true,
      message: 'Here Iam',
      data: user,
    });
  } catch (error) {
    next(error);
  }
};


export {
  login,
  createUser,
  getUserAll,
  createAdmin,
  createSuperAdmin,
  getMe
};