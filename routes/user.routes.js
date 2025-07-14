const express = require('express');
const { getUserProfile } = require('../controllors/user.controllor.js');
const authenticateJWT = require('../middleware/auth.middleware.js');

const router = express.Router();

router.get('/profile', authenticateJWT, getUserProfile);

module.exports = router;