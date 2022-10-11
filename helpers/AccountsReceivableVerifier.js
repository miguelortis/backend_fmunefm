const User = require("../models/user");
const AccountsReceivable = require("../models/accountsReceivable");
const BeginningOftheYear = require("../models/beginningOftheYear");
///////////moment///////
const moment = require("moment");
require('moment-timezone');


const AccountsReceivableVerifier = async () => {
  try {
    const users = await User.find({}, { idCard: 1, package: 1, paymentFrequency: 1, RegistrationDateUnefm: 1 }).populate("package");
    const months = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

    for (let i = 1; i <= users.length; i++) {
      const user = users[i - 1];

      console.log(user);
      const { _id, idCard, paymentFrequency, package, RegistrationDateUnefm } = user;
      if (user.package && user.package.price > 0) {
        console.log('padre if');
        const beginningOftheYear = await BeginningOftheYear.findOne({}, { month: 1 }).limit(1).sort({ $natural: -1 })
        const debts = await AccountsReceivable.findOne({ userId: user._id, "typeOfService.category": "package" }).limit(1).sort({ $natural: -1 })
        const control = await AccountsReceivable.findOne({}).limit(1).sort({ $natural: -1 })
        console.log('await padre if', control);
        let control_number = control?.controlNumber + 1;
        ////si posee deuda pendiente de paquete
        if (debts && debts.year === moment.tz('America/Caracas').format('YYYY')) {
          console.log('hermano 1');
          for (let i = parseInt(debts.month) + 1; i <= moment.tz('America/Caracas').format('MM'); i++) {
            control_number++;
            await AccountsReceivable.create({
              userId: _id,
              idCard: idCard,
              year: moment.tz('America/Caracas').format('YYYY'),
              month: `${i}`,
              controlNumber: control_number || 1,
              registrationDate: moment.tz('America/Caracas'),
              debt: package.price * paymentFrequency,
              typeOfService: {
                category: "package",
                name: package.name,
                serviceDescription: `Descuento mes ${months[i - 1]}`,

              }
            });

          }
        }
        /// si no posee deuda de paquete o posee deuda de años atras
        if (!debts || debts.year < moment.tz('America/Caracas').format('YYYY')) {
          console.log('hermano 2');
          //const dateCheck = await User.findOne({ _id: _id }, { RegistrationDateUnefm: 1 });
          ///// si el año de registro en la unefm es igual al año actual
          if (moment(RegistrationDateUnefm).format('YYYY') === moment.tz('America/Caracas').format('YYYY') && RegistrationDateUnefm !== null && RegistrationDateUnefm !== undefined && RegistrationDateUnefm !== '') {
            console.log('hijo 1');
            for (let i = parseInt(moment(RegistrationDateUnefm).format('MM')); i <= moment.tz('America/Caracas').format('MM'); i++) {
              console.log(_id, i)
              control_number++;
              await AccountsReceivable.create({
                userId: _id,
                idCard: idCard,
                year: moment.tz('America/Caracas').format('YYYY'),
                month: `${i}`,
                controlNumber: control_number || 1,
                registrationDate: moment.tz('America/Caracas'),
                debt: package.price,
                typeOfService: {
                  category: "package",
                  name: package.name,
                  serviceDescription: `Descuento mes ${months[i - 1]}`,
                }
              });

            }
          }
          if (moment(RegistrationDateUnefm).format('YYYY') < moment.tz('America/Caracas').format('YYYY') || RegistrationDateUnefm === '' || RegistrationDateUnefm === null || RegistrationDateUnefm === undefined) {
            console.log('hijo 2');

            for (let i = parseInt(beginningOftheYear.month); i <= moment.tz('America/Caracas').format('MM'); i++) {
              console.log(_id, i)
              console.log('iniciador:', i)
              control_number++;
              await AccountsReceivable.create({
                userId: _id,
                idCard: idCard,
                year: moment.tz('America/Caracas').format('YYYY'),
                month: `${i}`,
                controlNumber: control_number || 1,
                registrationDate: moment.tz('America/Caracas'),
                debt: package.price,
                typeOfService: {
                  category: "package",
                  name: package.name,
                  serviceDescription: `Descuento mes ${months[i - 1]}`,
                }
              });
            }

          }
        }
      }

    };
  } catch (error) {
    if (error) {
      console.log(error);
    }
  }
};
module.exports = AccountsReceivableVerifier;