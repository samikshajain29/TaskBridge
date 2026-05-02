import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';
import { generateAccessToken, generateRefreshToken } from '../utils/generateTokens.js';

// @desc    Register a new user
// @route   POST /api/auth/signup
// @access  Public
export const signup = async (req, res, next) => {
  try {
    const { name, email, password, avatar } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({
      name,
      email,
      password,
      avatar,
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Auth user & get tokens
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      const accessToken = generateAccessToken(user._id);
      const refreshToken = generateRefreshToken(user._id);

      // Save refresh token in DB
      user.refreshToken = refreshToken;
      await user.save();

      // Set cookie for refresh token
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV !== 'development', // Use secure cookies in production
        sameSite: 'strict', // Prevent CSRF attacks
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      res.status(200).json({
        accessToken,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
        },
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get new access token
// @route   POST /api/auth/refresh
// @access  Public
export const refresh = async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({ message: 'Not authorized, no refresh token' });
    }

    const user = await User.findOne({ refreshToken });

    if (!user) {
      return res.status(403).json({ message: 'Invalid refresh token' });
    }

    jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, (err, decoded) => {
      if (err || user._id.toString() !== decoded.id) {
        return res.status(403).json({ message: 'Invalid or expired refresh token' });
      }

      const accessToken = generateAccessToken(user._id);

      res.status(200).json({ accessToken });
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Logout user / clear cookie
// @route   POST /api/auth/logout
// @access  Public
export const logout = async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (refreshToken) {
      const user = await User.findOne({ refreshToken });
      if (user) {
        user.refreshToken = '';
        await user.save();
      }
    }

    res.cookie('refreshToken', '', {
      httpOnly: true,
      expires: new Date(0),
    });

    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user profile
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-password -refreshToken');

    if (user) {
      res.status(200).json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    next(error);
  }
};
