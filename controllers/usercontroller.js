const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Register
const registerUser = async (req, res) => {
  try {
    console.log('REGISTER Handler called', req.body && { email: req.body.email, name: req.body.name });
    // usercontroller.js (registerUser function)
const { name, mobile, address, email, password } = req.body;
if (!name || !email || !password) return res.status(400).json({ message: 'name, email and password required' }); 
// 👆 This check fails because 'name' is missing in req.body
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) return res.status(400).json({ message: 'User already exists' });

    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);

    const user = await User.create({ name, mobile, address, email: email.toLowerCase(), password: hashed });
    console.log('User created id=', user._id);

    return res.status(201).json({ message: 'User registered', user: { id: user._id, email: user.email, name: user.name } });
  } catch (err) {
    console.error('Register error:', err);
    return res.status(500).json({ message: 'Server Error' });
  }
};

// Login
const loginUser = async (req, res) => {
  try {
    console.log('LOGIN Handler called');
    console.log('Body:', req.body);

    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password are required' });

    const user = await User.findOne({ email: email.toLowerCase() });
    console.log('User from DB:', user ? { id: user._id, email: user.email, passwordHashStartsWith: user.password && user.password.slice(0,4) } : null);

    if (!user) {
      console.log('Login failed: user not found');
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    console.log('bcrypt.compare result:', isMatch);

    if (!isMatch) {
      console.log('Login failed: wrong password');
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET || 'secretkey', { expiresIn: '1h' });

    return res.json({ message: 'Login successful', token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { registerUser, loginUser };

