const express = require('express')
const router = express.Router()
const CheckAuth = require('../middlewares/checkauth')
const { getSinisters } = require('../controllers/sinisterController')
//service register
//router.post('/register', servRegister)

//get all sinister
router.get('/sinisters', CheckAuth, getSinisters)


module.exports = router