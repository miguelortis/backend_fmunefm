const express = require('express')
const router = express.Router()
const checkAuth = require("../middlewares/checkauth");

const { getDataUser, getUserPackage, updateUser, userRegister } = require('../controllers/userController');


//User register
router.post('/register', userRegister)

//Get user data
router.get('/:userID', checkAuth, getDataUser)

/* //get user package
router.get('/package/:userId', checkAuth, getUserPackage) */

//User modify
router.put('/update', checkAuth, updateUser)


module.exports = router