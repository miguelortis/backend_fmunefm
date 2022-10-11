const express = require('express')
const router = express.Router()
const checkauth = require("../middlewares/checkauth");

const { loginCtrl, getUserDataAuth } = require('../controllers/authController')

//User login
router.post('/login', loginCtrl)

//get user data when authenticating
router.get('/user', checkauth, getUserDataAuth)


module.exports = router