const express = require('express')
const router = express.Router()
const CheckAuth = require('../middlewares/checkauth')
const { servRegister, getDataUsers, userUpdate } = require('../controllers/adminController')
const checkIsAdmin = require('../middlewares/checkIsAdmin');
//service register
//router.post('/register', servRegister)

//get Users
router.get('/users', CheckAuth, checkIsAdmin, getDataUsers)

//service update
router.put('/user-update', CheckAuth, checkIsAdmin, userUpdate)


module.exports = router