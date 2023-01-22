const mongoose = require('mongoose')
const { httpError } = require('../helpers/handleError')
const { tokenSign } = require('../helpers/generateToken')
const bcrypt = require('bcryptjs')
const moment = require('moment')
const { isValidEmail } = require('../helpers')
require('moment-timezone')
// import models
const User = require('../models/user')
const Beneficiary = require('../models/beneficiary')

//Beneficiary register
const beneficiaryRegister = async (req, res) => {
  const { documentType, idCard, name, lastName, relationship, gender, dateBirth, placeBirth, phone } = req.body

  const BeneficiaryVerify = await Beneficiary.findOne({
    idCard: idCard,
  })
  try {
    if (BeneficiaryVerify) {
      await Beneficiary.findByIdAndUpdate(
        { _id: BeneficiaryVerify._id },
        {
          $addToSet: {
            userId: [
              {
                user: mongoose.Types.ObjectId(req.userData._id),
                relationship: relationship,
              },
            ],
          },
        },
        { new: true }
      )
      console.log('beneficiaryController 36', req.userData._id)
      await User.findByIdAndUpdate(
        { userName: req.userData.idCard },
        {
          $addToSet: {
            beneficiaries: [
              {
                beneficiary: mongoose.Types.ObjectId(BeneficiaryVerify._id),
                relationship: relationship,
              },
            ],
          },
        },
        { new: true }
      )
      console.log('User created successfully: ')
      return res.status(200).json({ message: 'Beneficiario agregado a tu carga familiar' })
    } else {
      const response = await Beneficiary.create({
        documentType,
        idCard,
        name,
        lastName,
        gender,
        dateBirth,
        placeBirth,
        phone,
        userId: [{ user: req.userData._id, relationship: relationship }],
      })
      await User.findByIdAndUpdate(
        { _id: req.userData._id },
        {
          $addToSet: {
            beneficiaries: {
              beneficiary: mongoose.Types.ObjectId(response._id),
              relationship: relationship,
            },
          },
        },
        { new: true }
      )
      console.log('User created successfully: ')
      return res.status(200).json({ message: 'Beneficiario agregado a tu carga familiar' })
    }
  } catch (error) {
    console.log('cath', error)
    if (error) {
      return res.status(400).send({ message: 'Beneficiario agregado a tu carga familiar' })
    }
    throw error
  }
}

//Get data Beneficiaries!
const getDataBeneficiaries = async (req, res) => {}

//Beneficiary update!
const beneficiaryUpdate = async (req, res) => {}

//Beneficiary delete!
const beneficiaryDelete = async (req, res) => {
  //console.log(req.headers, "hola");
  const { idCard } = req.params
  try {
    console.log(`han solicitado un .DELETE para la cedula:${idCard}`)
    const infoBorrado = await Beneficiary.find({ idCard: idCard })
    await Beneficiary.findOneAndDelete({ idCard: idCard })

    console.log(`Se ha borrado con exito la informacion ${infoBorrado}`)
    res.status(202).end()
  } catch (error) {
    console.log('ha fallado el .DELETE, respondiendo con un statusCode: 400')
    res.status(400).end()
  }
}

module.exports = { beneficiaryRegister, getDataBeneficiaries, beneficiaryUpdate, beneficiaryDelete }
