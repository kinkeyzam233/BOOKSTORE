const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
router.post('/signup', authController.registerUser);
router.get('/signup', (req, res) => {
    res.render('signup');
});
router.post('/login', authController.loginUser);
router.get('/login', (req, res) => {
    res.render('login');
});
router.get('/logout', authController.logoutUser);
module.exports = router;