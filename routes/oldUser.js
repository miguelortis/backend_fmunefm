const express = require('express')
const router = express.Router()
const CheckAuth = require('../middlewares/checkauth')
const { getUser, getOldUser, getOldUsers } = require('../controllers/oldUserController')
const checkIsAdmin = require('../middlewares/checkIsAdmin');
//service register
//router.post('/register', servRegister)

//get Users
router.get('', getOldUsers)

//get old user
router.get('/user',  CheckAuth, getOldUser)


module.exports = router