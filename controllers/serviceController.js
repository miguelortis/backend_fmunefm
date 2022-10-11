const { httpError } = require('../helpers/handleError')
// import models
const Service = require("../models/service");
///////////moment///////
const moment = require("moment");
require('moment-timezone');

//service register
const servRegister = async (req, res) => {
    ///console.log("****", req);
  const { price, name } =
  req.body;

const ServiceVerify = await Service.findOne({
  name: name,
});
if (ServiceVerify) {
  return res.status(400).json({ error: "Ya existe este servicio" });
}
const allServices = await Service.find();

try {

  const response = await Service.create({
    name,
    price,
  });
  return res
    .status(200)
    .json({ service: response });

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

//get services!
const getDataServices = async (req, res) => {
 //console.log(req.userData.id);
 try {
  const services = await Service.find()
  //console.log("beneficiaries", { Users, Beneficiaries });
  res.status(200).json(services);
} catch (error) {
  return res.status(400).json({ message: "ocurrio un problema" });
}
}

//service update!
const updateService = async (req, res) => {
  const { _id, name, price, status } = req.body;
  const verifyService = await Service.findOne({ name: name });
  if (verifyService.id !== _id) {
    return res.json({ status: 400, error: "Ya existe este servicio" });
  }
  const ModificationDate = moment.tz('America/Caracas');
  try {
    await Service.updateOne(
      { _id },
      {
        $set: { ModificationDate, name, price, status },
      }
    );
    const services = await Service.find()
    res.json({ status: 201, message: `El plan ${name} ha sido Actualizado con Exito`, services: services });
  } catch (error) {
    console.log(error);
    res.json({ status: 400, error: "Ocurrio un error con el Servidor" });
  }
}



module.exports = { servRegister, getDataServices, updateService }