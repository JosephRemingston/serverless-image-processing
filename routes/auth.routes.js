const express = require('express');
const { signup, confirmUser, signin } = require('../controllors/auth.controllor.js');

const router = express.Router();

router.post('/signup', signup);
router.post('/confirm-user', confirmUser);
router.post('/signin', signin);

module.exports = router;
