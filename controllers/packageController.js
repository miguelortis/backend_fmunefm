const mongoose = require('mongoose')
const { httpError } = require('../helpers/handleError')
// import models
const User = require('../models/user')
const Package = require('../models/package')
///////////moment///////
const moment = require('moment')
require('moment-timezone')

//Package register
const packRegister = async (req, res) => {
  const { price, name, services } = req.body

  const PackageVerify = await Package.findOne({
    name: name,
  })
  if (PackageVerify) {
    return res.status(204).json({ error: 'Este plan ya se encuentra registrado, asigne otro nombre por favor' })
  }
  try {
    const response = await Package.create({
      name,
      price,
      services,
    })
    console.log(response)

    return res.status(200).json({ package: await Package.find({ _id: response._id }).populate('services.service') })
  } catch (error) {
    console.log('cath', error)
    if (error) {
      return res.status(400).send({ success: false, error: 'Ocurrio un problema con el servidor' })
    }
    throw error
  }
}

//get Packages!
const getAllPackages = async (req, res) => {
  //clconsole.log('probando', req.query);
  try {
    /* const test = User.index( { name: "text", lastName: "text" } )
    console.log(test) */
    const rest = Package.find({ $text: { $search: 'pedro' } })
    const Packages = await Package.find().populate('services.service')
    res.status(200).json({
      content: Packages,
    })
  } catch (error) {
    console.log(error)
    return res.status(401).json({ message: 'no autorizado' })
  }
}

//get user Package!
const getUserPackage = async (req, res) => {
  const { userId } = req.params
  try {
    if (userId) {
      const package = await Package.findOne({ users: { $in: [userId] } }).populate('services.service')
      if (package) {
        return res.status(200).json({ content: package })
      } else {
        return res.status(204).json({ message: 'Este usuario no posee plan o no existe' })
      }
    } else {
      return res.status(400).json({ message: 'Debes proporcionar un ID de usuario' })
    }
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: 'Ocurrio un error con el Servidor' })
  }
}

//add Package To User!
const updateUserPackage = async (req, res) => {
  const { userId, packageId } = req.params

  const currentUserData = await User.findOne({ _id: userId })
  const packageToUpdate = await Package.findOne({ _id: packageId })

  if (!currentUserData) {
    return res.status(400).json({ message: 'EL ID DE USUARIO PROPORCIONADO NO EXISTE' })
  }
  if (!packageToUpdate || packageToUpdate.status === false) {
    return res.status(400).json({ message: 'EL ID DEL PACKETE PROPORCIONADO NO EXISTE O ESTA INACTIVO' })
  }
  try {
    //const existsInUser = await User.find({"package" : { $in : [packageId]}})

    //Eliminamos el id del usuario del paquete actual
    await Package.updateMany({}, { $pull: { users: { $in: [mongoose.Types.ObjectId(userId)] } } })
    //Agregamos al paquete que se va actualizar el id del usuario
    await Package.findByIdAndUpdate(
      { _id: packageId },
      {
        $addToSet: {
          users: mongoose.Types.ObjectId(userId),
        },
      },
      { new: true }
    )
    //actualizamos el id del paquete al usuario
    await User.findByIdAndUpdate(
      { _id: userId },
      {
        $set: {
          package: mongoose.Types.ObjectId(packageId),
        },
      },
      { new: true }
    )

    return res.status(200).json({ message: 'PAQUETE DEL USUARIO ACTUALIZADO EXITOSAMENTE' })
  } catch (error) {
    console.log(error)
    if (error) {
      await Package.updateMany({}, { $pull: { users: { $in: [mongoose.Types.ObjectId(userId)] } } })
      await Package.findByIdAndUpdate(
        { _id: currentUserData.package },
        {
          $addToSet: {
            users: mongoose.Types.ObjectId(userId),
          },
        },
        { new: true }
      )
      await User.findByIdAndUpdate(
        { _id: userId },
        {
          $set: {
            package: mongoose.Types.ObjectId(currentUserData.package),
          },
        },
        { new: true }
      )
      return res.status(500).json({ message: 'OCURRIO UN ERROR EN EL SERVIDOR' })
    }
  }
}

//Package update!
/* const updateUserPackage = async (req, res) => {
  const { userId, packageId } = req.params
  try {
    if(userId && packageId){
      await Package.findByIdAndUpdate(
        { _id: packageId },
        {
          $addToSet: {
            users: [
                mongoose.Types.ObjectId(req.userData._id),
            ],
          },
        },
        { new: true }
      );
      await User.findByIdAndUpdate(
        { _id: userId },
        {
          $addToSet: {
            package: mongoose.Types.ObjectId(req.userData._id),
          },
        },
        { new: true }
      );

    }

    const packages = await Package.find().populate("services.service");
    res.json({ status: 201, message: `El plan ${name} ha sido Actualizado con Exito`, packages: packages });
  } catch (error) {
    console.log(error);
    res.json({ status: 400, error: "Ocurrio un error con el Servidor" });
  }
} */
const updatePackage = async (req, res) => {
  const { _id, name, price, services, status } = req.body
  const ModificationDate = new Date()
  try {
    await Package.updateOne(
      { _id },
      {
        $set: { ModificationDate, name, price, services, status },
      }
    )
    const packages = await Package.find().populate('services.service')
    res.json({ status: 201, message: `El plan ${name} ha sido Actualizado con Exito`, packages: packages })
  } catch (error) {
    console.log(error)
    res.json({ status: 400, error: 'Ocurrio un error con el Servidor' })
  }
}

module.exports = {
  packRegister,
  getUserPackage,
  getAllPackages,
  updateUserPackage,
  updatePackage,
  /* addPackageToUser */
}
