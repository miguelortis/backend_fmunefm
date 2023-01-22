const { httpError } = require('../helpers/handleError')
const { tokenSign } = require('../helpers/generateToken')
const bcrypt = require('bcryptjs')
const { isValidEmail } = require('../helpers')
require('moment-timezone')
// import models
const User = require('../models/user')
const OldUser = require('../models/oldUser')

//User login!
const loginCtrl = async (req, res) => {
  console.log(req.body)
  try {
    const { idCard, password } = req.body
    // const user = await User.findOne({ idCard }).lean();
    const user = await User.findOne({ userName: idCard }).populate('user')
    if (!user) {
      return res.status(400).json({ status: 400, message: 'Este usuario no se encuentra registrado' })
    }

    if (!(await bcrypt.compare(password, user.password))) {
      return res.json({ status: 400, message: 'Contraseña incorrecta!' })
    }
    if (user.status === 2) {
      return res.json({ status: 400, message: 'usuario en espera por verificacion' })
    }
    if (user.status === 3) {
      return res.json({
        status: 400,
        message: 'Usuario rechazado por no cumplir los requisitos, comuniquese al correo SOPORTEFMUNEFM@GMAIL.COM',
      })
    }
    if (user.status === 4) {
      return res.json({ status: 400, message: 'Usuario suspendido, comuniquese al correo SOPORTEFMUNEFM@GMAIL.COM' })
    }
    const token = await tokenSign(user)

    return res.json({ status: 200, token: token })
  } catch (e) {
    httpError(res, e)
  }
}

//get user data when authenticating
const getUserDataAuth = async (req, res) => {
  console.log(req.userData._id)
  try {
    const user = await User.findOne({ _id: req.userData._id }).populate('beneficiaries.beneficiary').populate('user')
    if (!user) return res.status(401)
    if (user) return res.status(200).json({ content: user })
  } catch (error) {
    console.log('error', error)
    return res.status(401).json({ message: 'no autorizado' })
  }
}

// get old user
const getOldUser = async (req, res) => {
  console.log(req.params.idCard, '*')
  try {
    const user = await OldUser.findOne({ cedula: req.params.idCard })
    if (!user) {
      return res.json({ status: 400, message: 'Este usuario no se encuentra registrado' })
    }
    const dataToke = { idCard: user.cedula, _id: user._id }
    const token = await tokenSign(dataToke)

    return res.json({ status: 200, token: token })
  } catch (e) {
    httpError(res, e)
  }
}

module.exports = { loginCtrl, getUserDataAuth, getOldUser }
