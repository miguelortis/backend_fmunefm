const mongoose = require("mongoose");
const { httpError } = require('../helpers/handleError')
const bcrypt = require("bcrypt");
const User = require('../models/User')
const Beneficiary = require("../models/beneficiary");
const { isValidEmail } = require("../helpers");
//User register!
const userRegister = async (req, res) => {
  try {
    const {
        idCard,
        password: plainTextPassword,
        documentType,
        name,
        lastName,
        address,
        email,
        sex,
        placeBirth,
        dateBirth,
        civilStatus,
        category,
        personalType,
        phone,
        unefmDate,
      } = req.body;
    
      if (!email || !isValidEmail(email)) {
        return res.status(400).json({ message: "Introduce un Email valido" });
      }
    
      if (plainTextPassword.length < 8) {
        return res.status(400).json({ message: "Introduce una Contraseña mayor a 8 digitos"});
      }
      const idCardVerify = await User.findOne({ userName: idCard });
      if (idCardVerify) {
        return res.status(400).json({ message: "Esta cedula ya existe" });
      }
      const idEmailVerify = await User.findOne({ email: email });
      if (idEmailVerify) {
        return res.status(400).json({ message: "Este email ya existe" });
      }
      const password = await bcrypt.hash(plainTextPassword, 10);
console.log('1')
      const beneficiary = await Beneficiary.findOne({idCard: idCard});
      console.log(beneficiary)
      if(!beneficiary){
        beneficiary = await Beneficiary.create({
          documentType,
          idCard,
          name,
          lastName,
          sex,
          dateBirth,
          placeBirth,
          phone,
        });
      }
      console.log('2')
          const userData = await User.create({
            user: mongoose.Types.ObjectId(beneficiary._id),
            userName: idCard,
            password,
            address,
            email,
            civilStatus,
            category,
            personalType,
            unefmDate,
          });
          console.log('3')
        await Beneficiary.findByIdAndUpdate(
          { _id: beneficiary._id },
          {
            $addToSet: {
              userId: [
                {
                  user: mongoose.Types.ObjectId(userData._id),
                  relationship: 'Titular',
                },
              ],
            },
          },
          { new: true }
        )
        console.log("User created successfully", userData);
        return res.status(200).json({ message: "Usuario registrado con exito" });
      } catch (error) {
        if (error) {
          return res.status(500).json({ message: "Ocurrio un problema con el servidor" });
        }
        throw error;
      }
}

//get user
const getDataUser = async (req, res) => {
    try {
        const user = await User.findOne({ _id: req.userData._id }).populate(
          "beneficiaries.beneficiary"
        ).populate('user');
        console.log('error',req.userData._id)
        res.status(200).json(user);
      } catch (error) {
        console.log('error',error)
        return res.status(401).json({ message: "no autorizado" });
      }
}

//get user package
const getUserPackage = async (req, res) => {
 console.log(req.params.userId)
}

const updateUser = async (req, res) => {
  const { email } = req.body;
  let bodySchema = {}
  for (const key in req.body) {
    if (key !== 'idCard' && key !== '_id') {
      bodySchema = {...bodySchema, [key]:req.body[key]}
    }
  }
  
  const emailVerify = await User.findOne({ email: email });
  if (emailVerify) {
    return res.json({ status: 403, error: "Este email ya existe" });
  }
  //console.log(req.headers.authorization);
  try {
    const _id = req.userData._id;
    //console.log(_id);
    await User.updateOne(
      { _id },
      {
        $set: bodySchema,
      }
    );
    res.json({ status: 201, message: "successfully" });
  } catch (error) {
    console.log(error);
    res.json({ status: 400, error: ";))" });
  }
}


module.exports = { getDataUser, updateUser, userRegister, getUserPackage }