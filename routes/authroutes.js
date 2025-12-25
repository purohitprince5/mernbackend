const express = require('express');
const router = express.Router();
const { registerUser, loginUser } = require('../controllers/usercontroller');
const authMiddleware = require('../middleware/authMiddleware');

// Public
router.post('/register', registerUser);
router.post('/login', loginUser);

// Protected
router.get('/me', authMiddleware, (req, res) => {
  res.json(req.user);
});

module.exports = router;