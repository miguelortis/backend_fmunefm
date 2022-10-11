const express = require('express')
const router = express.Router()

const {getRate, getAllRates, updateExRate } = require('../controllers/ratesController')

//exRate register
//router.post('/register', exRateRegister)

//Get all rates
router.get('', getAllRates)

//Get rate
router.get('/:currency', getRate)

//exRate update
router.put('/update', updateExRate)


module.exports = router