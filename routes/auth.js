const express = require('express')
const router = express.Router()
const checkauth = require("../middlewares/checkauth");

const { loginCtrl, getUserDataAuth, getOldUser } = require('../controllers/authController')

//User login
router.post('/login', loginCtrl)

//get user data when authenticating
router.get('/user', checkauth, getUserDataAuth)

//get old user
router.get('/oldUser/:idCard',  getOldUser)


module.exports = router