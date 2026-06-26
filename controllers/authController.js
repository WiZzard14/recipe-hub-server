import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const register = async (req, res) => {
  try {
    const { name, email, password, image } = req.body;

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z]).{6,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({ 
        message: "Password must be at least 6 characters long, with one uppercase and one lowercase letter." 
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists with this email!" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      image: image || ""
    });

    await newUser.save();
    res.status(201).json({ message: "User registered successfully!" });

  } catch (error) {
    console.error("Registration Error:", error);
    res.status(500).json({ message: "Server error during registration" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found!" });
    }

    if (user.isBlocked) {
      return res.status(403).json({ message: "Your account is blocked by admin." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials!" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role, isPremium: user.isPremium, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days expiration
    });

    res.status(200).json({ 
      message: "Logged in successfully!", 
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email, 
        image: user.image,
        role: user.role,
        isPremium: user.isPremium
      } 
    });

  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Server error during login" });
  }
};

export const logout = async (req, res) => {
  try {
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ message: "Logout failed" });
  }
};

export const googleLogin = async (req, res) => {
  try {
    const { name, email, image } = req.body;

    let user = await User.findOne({ email });

    if (!user) {
      const generatedPassword = Math.random().toString(36).slice(-8) + "A1a@";
      const hashedPassword = await bcrypt.hash(generatedPassword, 10);

      user = new User({
        name,
        email,
        image: image || "",
        password: hashedPassword,
      });

      await user.save();
    }

    if (user.isBlocked) {
      return res.status(403).json({ message: "Your account is blocked by admin." });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role, isPremium: user.isPremium, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 
    });

    res.status(200).json({ 
      message: "Google login successful!", 
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email, 
        image: user.image,
        role: user.role,
        isPremium: user.isPremium
      } 
    });

  } catch (error) {
    console.error("Google Login Error:", error);
    res.status(500).json({ message: "Server error during Google login" });
  }
};

export const getMe = async (req, res) => {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ message: "Unauthorized" });
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);
        res.status(200).json({ user });
    } catch (err) {
        res.status(401).json({ message: "Unauthorized" });
    }
};