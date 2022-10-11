const { httpError } = require('../helpers/handleError')
const User = require('../models/User')

// user update
const userUpdate = async (req, res) => {
  console.log(req.body)
  const { data, id } = req.body;
  if (data.idCard) {
    const verifyIdCard = await User.findOne({ idCard: data.idCard });
    if (verifyIdCard) {
      return res.json({ status: 400, error: "Esta cedula ya pertenece a otro Titular" });
    }
  }
  if (data.email) {
    const verifyEmail = await User.findOne({ email: data.email });
    if (verifyEmail) {
      return res.json({ status: 400, error: "Este email ya pertenece a otro Titular" });
    }
  }
  // res.json({
  //   status: 201, message: "actualizado", res: req.body
  // })
  try {
    const res1 = await User.updateOne(
      { _id: id },
      {
        $set: { ...data },
      }
    );
    console.log("exitoso", res1)
    const response = await User.findOne({ _id: id }).populate('package')
    res.json({ status: 201, message: `Usuario actualizado con Éxito`, res: response });
  } catch (error) {
    console.log(error);
    res.json({ status: 400, error: "Ocurrio un error con el Servidor" });
  }
}

// get all users
const getDataUsers = async(req, res) => {
try {
  const users = await User.find().populate('package')
  res.status(200).json(users);
} catch (error) {
  return res.status(401).json({ message: "no autorizado" });
}
}


module.exports = { userUpdate, getDataUsers}