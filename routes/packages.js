const express = require('express')
const router = express.Router()
const checkAuth = require("../middlewares/checkauth");

const { packRegister, getUserPackage, updateUserPackage, getAllPackages, updatePackage } = require('../controllers/packageController')

///////// POST ///////////

//Package register
router.post('/register', packRegister)

///////// GET ///////////

//get user package
router.get('/:userId', getUserPackage) 

//get all Packages
router.get('', getAllPackages)

///////// PUT ///////////

//add package to user
router.put('/:packageId/:userId', checkAuth, updateUserPackage) 

//update user package
/* router.put('/update/:packageId/:userId', checkAuth,  updateUserPackage) */

//Package update
router.put('/update', updatePackage)

///////// DELETE ///////////


module.exports = router