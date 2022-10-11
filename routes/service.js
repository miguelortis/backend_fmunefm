const express = require('express')
const router = express.Router()

const { servRegister, getDataServices, updateService } = require('../controllers/serviceController')

//service register
router.post('/register', servRegister)

//get services
router.get('/datas', getDataServices)

//service update
router.put('/update', updateService)


module.exports = router