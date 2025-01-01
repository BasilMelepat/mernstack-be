const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const verifyUser = require('../middleware/authMiddleware');

router.post('/login', authController.login);
router.post('/register', authController.register);
router.post('/logout', authController.logout);
router.get('/verify', verifyUser, authController.verifyAuth);
router.get('/home', verifyUser, authController.getHome);

module.exports = router;