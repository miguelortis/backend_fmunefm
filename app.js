const mongoose = require("mongoose");
const express = require("express");
require("dotenv").config();
const path = require("path");
const bodyParser = require("body-parser");
const User = require("./model/user");
const Beneficiary = require("./model/beneficiary");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const _connect = require("./db/_connect");
const { isValidEmail } = require("./helpers");
const cors = require("cors");
const checkauth = require("./midlewares/checkauth");

const JWT_SECRET = "fMunefM-Created1995ForUniversityNationalFRanciScOdeMirand@";
//Connect MONGODB

// mongoose.connect("mongodb://localhost:27017/login-app-db", {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
//   useCreateIndex: true,
// });
_connect();
////////////////

const app = express();
//app.use("/", express.static(path.join(__dirname, "static")));
app.use(bodyParser.json());
app.use(cors());
app.post("/fmunefm/change-password", async (req, res) => {
  const { token, newpassword: plainTextPassword } = req.body;

  if (!plainTextPassword || typeof plainTextPassword !== "string") {
    return res.json({ status: "error", error: "Invalid password" });
  }

  if (plainTextPassword.length < 5) {
    return res.json({
      status: "error",
      error: "Password too small. Should be atleast 6 characters",
    });
  }

  try {
    const user = jwt.verify(token, process.env.JWT_SECRET);

    const _id = user.id;

    const password = await bcrypt.hash(plainTextPassword, 10);

    await User.updateOne(
      { _id },
      {
        $set: { password },
      }
    );
    res.json({ status: "ok" });
  } catch (error) {
    console.log(error);
    res.json({ status: "error", error: ";))" });
  }
});

app.post("/fmunefm/login", async (req, res) => {
  const { idCard, password } = req.body;
  const user = await User.findOne({ idCard }).lean();

  if (!user) {
    return res.json({ status: 204, error: "Invalid username/password" });
  }

  if (!(await bcrypt.compare(password, user.password))) {
    // the username, password combination is successful
    res.json({ status: 400, error: "Contraseña incorrecta!" });
  }
  if (user.accountVerification === false) {
    // the username, password combination is successful
    res.json({ status: 401, error: "usuario en espera por verificacion" });
  }
  const token = jwt.sign(
    {
      id: user._id,
      idCard: user.idCard,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: 60 * 60 * 2, // seconds
    }
  );

  return res.json({ status: 202, data: token });

  //   res.json({ status: "error", error: "Invalid username/password" });
});

app.post("/fmunefm/register", async (req, res) => {
  const {
    idCard,
    password: plainTextPassword,
    documentType,
    name,
    lastName,
    direction,
    email,
    sex,
    placeBirth,
    dateBirth,
    civilStatus,
    category,
    personalType,
  } = req.body;

  if (!email || !isValidEmail(email)) {
    return res
      .status(400)
      .send({ success: false, error: "introduce un Email valido" });
  }

  if (!idCard || typeof idCard !== "string") {
    return res
      .status(400)
      .send({ success: false, error: "introduce una cedula valida" });
  }
  if (!plainTextPassword || typeof plainTextPassword !== "string") {
    return res
      .status(400)
      .send({ success: false, error: "introduce una Contraseña valida" });
  }

  if (plainTextPassword.length < 8) {
    return res.status(400).send({
      success: false,
      error: "introduce una Contraseña mayor a 8 digitos",
    });
  }
  const idCardVerify = await User.findOne({ idCard: idCard });
  if (idCardVerify) {
    return res
      .status(400)
      .send({ success: false, error: "Esta cedula ya existe" });
  }
  const idEmailVerify = await User.findOne({ email: email });
  if (idEmailVerify) {
    return res
      .status(400)
      .send({ success: false, error: "Este email ya existe" });
  }

  try {
    const password = await bcrypt.hash(plainTextPassword, 10);
    const response = await User.create({
      documentType,
      idCard,
      password,
      name,
      lastName,
      direction,
      email,
      sex,
      placeBirth,
      dateBirth,
      civilStatus,
      category,
      personalType,
    });
    console.log("User created successfully: ", response);
  } catch (error) {
    if (error) {
      return res
        .status(400)
        .send({ success: false, error: "Llene todos los campos" });
    }
    throw error;
  }
  return res
    .status(201)
    .send({ success: true, error: "User created successfully" });
});

app.post("/fmunefm/beneficiaries", async (req, res) => {
  //console.log("holaaaaaaaaaaaaaaa", req.body.id);
  try {
    const user = await Beneficiary.find({
      userId: req.body.id,
    });

    //console.log("hola soy user", user);
    res.status(200).json(user);
  } catch (error) {
    console.log("error", error);
    return res.status(401).json({ message: "no autorizado" });
  }
});

app.get("/profile", checkauth, async (req, res) => {
  console.log(req.userData.id);
  try {
    const user = await User.findOne({ _id: req.userData.id }).populate(
      "beneficiaries"
    );

    res.status(200).json(user);
  } catch (error) {
    return res.status(401).json({ message: "no autorizado" });
  }
});

app.post("/fmunefm/beneficiariy/register", checkauth, async (req, res) => {
  ///console.log("****", req);
  const { documentType, idCard, name, lastName, relationship, sex, dateBirth } =
    req.body;

  // if (!idCard || typeof idCard !== "string") {
  //   return res
  //     .status(401)
  //     .send({ success: false, error: "introduce una cedula valida" });
  // }
  if (idCard === req.userData.idCard) {
    return res.status(400).send({
      success: false,
      error: "Eres titular no te puedes agregar a tu propia carga familiar",
    });
  }

  try {
    const idCardVerify = await Beneficiary.findOne({
      userId: req.userData.id,
      idCard: req.body.idCard,
    });

    if (idCardVerify) {
      return res.status(400).send({
        success: false,
        error: "Ya tienes Este Miembro en tu carga familiar",
      });
    } else {
      const response = await Beneficiary.create({
        documentType,
        idCard,
        name,
        lastName,
        relationship,
        sex,
        dateBirth,
        userId: req.userData.id,
      });
      //console.log(response);
      await User.findByIdAndUpdate(
        { _id: req.userData.id },
        {
          $addToSet: {
            beneficiaries: mongoose.Types.ObjectId(response._id),
          },
        },
        { new: true }
      );
      return res.status(200).json(response);
      //console.log("User created successfully: ", response);
    }
  } catch (error) {
    console.log("cath", error);
    if (error) {
      return res
        .status(400)
        .send({ success: false, error: "Llene todos los campos" });
    }
    throw error;
  }
});

app.listen(process.env.PORT, () => {
  console.log(`Server up at ${process.env.PORT}`);
});
