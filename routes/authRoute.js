const express = require('express');
const {login,signupUser,getUserProfile,updateUserProfile,checkEmail} = require('../controllers/authController');

const router= express.Router();


router.post('/signup', signupUser);
router.post('/login', login);

router.post('/profile', getUserProfile);
router.post('/checkEmail',checkEmail )
// New route for updating the user profile
router.put('/profile/:userId',updateUserProfile);
module.exports = router; 

