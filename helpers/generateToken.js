const jwt = require('jsonwebtoken') 

const tokenSign = async (user) => {
    return jwt.sign(
        {
            _id: user._id, 
            idCard: user.idCard
        }, 
        process.env.JWT_SECRET, 
        {
            expiresIn: "8h", 
        }
    );
}

const verifyToken = async (token) => {
    try {
        return jwt.verify(token, process.env.JWT_SECRET)
    } catch (e) {
        return null
    }
}

const decodeSign = (token) => { //TODO: Verificar que el token sea valido y correcto
    return jwt.decode(token, null)
}



module.exports = { tokenSign, decodeSign, verifyToken }