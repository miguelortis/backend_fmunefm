const express = require('express')
const router = express.Router()
const checkauth = require("../middlewares/checkauth");

const { beneficiaryRegister, getDataBeneficiaries, beneficiaryUpdate, beneficiaryDelete } = require('../controllers/beneficiaryController')

//beneficiary register
router.post('/register', checkauth, beneficiaryRegister)

//Get data beneficiary
router.get('/data', checkauth)


//Get data beneficiaries
router.get('/datas', getDataBeneficiaries)

//beneficiary modify
router.patch('/update', beneficiaryUpdate)

//beneficiary delete
router.patch('/:idCard', beneficiaryDelete)


module.exports = router