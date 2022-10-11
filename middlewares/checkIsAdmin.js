const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const {name, options} = req.userData.role
 if(name === 'SUDO' || name === 'ADMIN'){
   next();
 }else{
  res.status(401).json({ message: "No tienes permisos para esta acción" });
 }
};
