const express = require('express');
const router = express.Router();

const authController = require('../controller/auth');

router.get('/', authController.getIndex);

router.post('/signup', authController.postSignUp);

router.post('/login', authController.postLogin);

router.post('/logout', authController.postLogout);

module.exports = router;