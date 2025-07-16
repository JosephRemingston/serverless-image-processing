const express = require('express');
const { getUserProfile } = require('../controllors/user.controllor.js');
const { verifyJWT } = require('../middleware/auth.middleware.js');

const router = express.Router();

router.get('/profile', verifyJWT, getUserProfile);

module.exports = router;