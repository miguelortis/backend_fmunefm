const mongoose = require("mongoose");

function _connect() {
  //conexion a mongodb
  mongoose
    .connect(process.env.URI_MONGODB, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
      //useCreateIndex: true, //make this true
      autoIndex: true, //make this also true
    })
    .then(() => {
      console.log("Se ha conectado a la base de datos con exito");
    })
    .catch((err) => {
      console.error(err);
      console.log("Ha fallado la conexion a la base de datos");
    });
}
module.exports = _connect;
