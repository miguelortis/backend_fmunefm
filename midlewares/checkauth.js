const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  console.log(req.headers);
  try {
    const token = req.headers.authorization.split(" ")[1];
    //console.log(token);

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userData = decoded;
    //console.log(decoded);
    next();
  } catch (error) {
    return res.status(401).json({ message: "token invalid" });
  }
};
