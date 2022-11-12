const { httpError } = require('../helpers/handleError')
const User = require('../models/User')
const OldUser = require('../models/oldUser')

// get all users
const getUsers = async(req, res) => {
try {
  const users = await User.find().populate('package')
  res.status(200).json(users);
} catch (error) {
  return res.status(401).json({ message: "no autorizado" });
}
}
// get user
const getUser = async(req, res) => {
try {
  const users = await User.find().populate('package')
  res.status(200).json(users);
} catch (error) {
  return res.status(401).json({ message: "no autorizado" });
}
}
// get old users
const getOldUsers = async(req, res) => {
  console.log(req.param, '**')
try {
  const oldUsers = await OldUser.find()
  console.log(oldUsers)
  res.status(200).json({content: oldUsers});
} catch (error) {
  return res.status(401).json({ message: "no autorizado" });
}
}
// get old user
const getOldUser = async(req, res) => {
  console.log(req.userData, '***')
  try {
    if(!req.userData._id){
      return res.json({status: 400, message: 'El usuario no existe'});
    }
    const user = await OldUser.findOne({_id: req.userData._id})
  
    return res.status(200).json({content: user});
} catch (e) {
    httpError(res, e)
}
}


module.exports = { getUser, getUsers, getOldUser, getOldUsers}