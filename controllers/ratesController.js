const { httpError } = require('../helpers/handleError')
// import models
const Rate = require("../models/rate");
///////////moment///////
const moment = require("moment");
require('moment-timezone');

//exRates register
const exRateRegister = async (req, res) => {
  console.log('test')
}

//get all rates!
const getAllRates = async (req, res) => {
  try {
    const response = await Rate.find({}, { old_rates: { $slice: -5 } })
    if(response){
      return res.status(200).json({content: response});
    }else{
      return res.status(200).json({message: 'No hay ningun tipo de divisa registrado'});
    }
  } catch (error) {
    return res.status(500).json({ message: "no autorizado" });
  }
}

//get rate!
const getRate = async (req, res) => {
  try {
    const response = await Rate.findOne({currency: req.params.currency}, { old_rates: { $slice: -5 } })
    if(response){
      return res.status(200).json({content: response});
    }else{
      return res.status(200).json({message: 'No hay ningun tipo de divisa registrado'});
    }
  } catch (error) {
    return res.status(500).json({ message: "no autorizado" });
  }
}

//exRates update!
const updateExRate = async (req, res) => {
  const { _id, price, currency } = req.body;
  const registrationDate = new Date();
  try {

    const response = await Rate.updateOne(
      { currency: currency },
      {
        $set: {
          dateBCV: registrationDate,
          registrationDate: registrationDate,
          price,
          currency,
        },
        $addToSet: {
          old_rates: [
            {
              dateBCV: registrationDate,
              registrationDate: registrationDate,
              price,
              currency,
              updateType: "manual",

            },
          ],
        },
      },
    );
    const data = await ExchangeRate.find({ currency: currencyType }, { old_rates: { $slice: -5 } })
    res.json({ status: 201, Rates: data, message: "Se actualizo el tipo de cambio" });
    console.log(response)
  } catch (error) {
    return res.status(401).json({ message: "no autorizado" });
  }
}



module.exports = {  exRateRegister, getAllRates, getRate, updateExRate }