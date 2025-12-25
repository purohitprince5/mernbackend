const express = require('express');
const router = express.Router();
const User = require('../models/User'); 
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'yourSecretKey';

// LOGIN
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // findOne returns a single document (not an array)
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' });

    // do not send password back
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// REGISTER
router.post('/register', async (req, res) => {
  try {
    const { name, mobile, address, email, password } = req.body || {};

    if (!name || !mobile || !address || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // check existing user by email or mobile
    const existing = await User.findOne({ $or: [{ email: email.toLowerCase() }, { mobile }] });
    if (existing) {
      return res.status(400).json({ message: 'User with this email or mobile already exists.' });
    }

    // hash password
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);

    const user = new User({
      name,
      mobile,
      address,
      email: email.toLowerCase(),
      password: hashed
    });

    await user.save();

    res.status(201).json({
      message: 'User registered successfully',
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ message: 'Server Error during registration.' });
  }
});

// other CRUD routes (keeps same behavior but ensure passwords not leaked)
router.post('/', async (req, res) => {
  try {
    const newUser = await User.create(req.body);
    // remove password from response if present
    if (newUser && newUser.password) newUser.password = undefined;
    res.status(201).json(newUser);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error creating user.');
  }
});

router.get('/', async (req, res) => {
  try {
    const users = await User.find().select('-password'); 
    res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error retrieving users.');
  }
});

router.put('/:id', async (req, res) => {
  try {
    // if password is being updated, hash it
    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      req.body.password = await bcrypt.hash(req.body.password, salt);
    }

    const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }).select('-password');
    if (!updatedUser) return res.status(404).json({ message: 'User not found' });
    res.json(updatedUser);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error updating user.');
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser) return res.status(404).json({ message: 'User not found' });
    res.json({ message: "User successfully removed" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error deleting user.');
  }
});

router.get('/test', (req, res) => {
  res.send('User API test route running!');
});

module.exports = router;