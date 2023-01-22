const express = require('express')
const router = express.Router()
const checkAuth = require('../middlewares/checkauth')

const { roleRegister, getRoles, roleUpdate, roleDelete } = require('../controllers/roleController')

//User register
router.post('/', checkAuth, roleRegister)

//Get user data
/* router.get('/:userID', checkAuth, getRoleById)
 */
//Get user data
/* router.get('/', checkAuth, getRoles) */

/* //get user package
router.get('/package/:userId', checkAuth, getUserPackage) */

//role updape
/* router.put('/', checkAuth, roleUpdate) */

//role updape
/* router.put('/delete', checkAuth, deleteUpdate) */

module.exports = router
