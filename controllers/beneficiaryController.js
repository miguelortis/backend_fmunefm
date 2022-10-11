const mongoose = require("mongoose");
const { httpError } = require('../helpers/handleError')
const { tokenSign } = require('../helpers/generateToken')
const bcrypt = require("bcryptjs");
const moment = require("moment");
const { isValidEmail } = require("../helpers");
require('moment-timezone');
// import models
const User = require("../models/User");
const Beneficiary = require("../models/beneficiary");

//Beneficiary register
const beneficiaryRegister = async (req, res) => {
    ///console.log("****", req);
  const { documentType, idCard, name, lastName, relationship, sex, dateBirth } =
  req.body;

const BeneficiaryVerify = await Beneficiary.findOne({
  idCard: idCard,
});
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
  );
  console.log('beneficiaryController 36', req.userData._id )
  await User.findByIdAndUpdate(
    { _id: req.userData._id },
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
  );
  return res.status(200).json(BeneficiaryVerify);
}

if (idCard === req.userData.idCard) {
  return res.status(401).send({
    success: false,
    error: "Eres titular no te puedes agregar a tu propia carga familiar",
  });
}

try {
  // const idCardVerify = await Beneficiary.findOne({
  //   userId: req.userData.id,
  //   idCard: req.body.idCard,
  // });

  // if (idCardVerify) {
  //   return res.status(402).send({
  //     success: false,
  //     error: "Ya tienes Este Miembro en tu carga familiar",
  //   });
  // } else {
  //console.log("try ", req.body);
  const response = await Beneficiary.create({
    documentType,
    idCard,
    name,
    lastName,
    sex,
    dateBirth,
    userId: [{ user: req.userData._id, relationship: relationship }],
  });
  //console.log("despues de response", response);
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
  );
  console.log("User created successfully: ", response);
  return res
    .status(200)
    .json({ beneficiary: response, relationship: relationship });
  // }
} catch (error) {
  console.log("cath", error);
  if (error) {
    return res
      .status(400)
      .send({ success: false, error: "Llene todos los campos" });
  }
  throw error;
}
}

//Get data Beneficiaries!
const getDataBeneficiaries = async (req, res) => {

}

//Beneficiary update!
const beneficiaryUpdate = async (req, res) => {

}

//Beneficiary delete!
const beneficiaryDelete = async (req, res) => {
 //console.log(req.headers, "hola");
 const { idCard } = req.params;
 try {
   console.log(`han solicitado un .DELETE para la cedula:${idCard}`);
   const infoBorrado = await Beneficiary.find({ idCard: idCard });
   await Beneficiary.findOneAndDelete({ idCard: idCard });

   console.log(`Se ha borrado con exito la informacion ${infoBorrado}`);
   res.status(202).end();
 } catch (error) {
   console.log("ha fallado el .DELETE, respondiendo con un statusCode: 400");
   res.status(400).end();
 }
}



module.exports = { beneficiaryRegister, getDataBeneficiaries, beneficiaryUpdate, beneficiaryDelete }