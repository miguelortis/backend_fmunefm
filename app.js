const mongoose = require("mongoose");
const express = require("express");
require("dotenv").config();
const path = require("path");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const _connect = require("./db/_connect");
const { isValidEmail } = require("./helpers");
const cors = require("cors");
const checkauth = require("./midlewares/checkauth");
const SocketIo = require("socket.io");
///////import models
const User = require("./model/user");
const Beneficiary = require("./model/beneficiary");
const MedicalConsultation = require("./model/MedicalConsultation");

//const JWT_SECRET = "fMunefM-Created1995ForUniversityNationalFRanciScOdeMirand@";
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

app.patch("/fmunefm/modify-headline", checkauth, async (req, res) => {
  const { email, phone } = req.body;
  //console.log(req.body);
  //console.log(req.headers);
  // if (!email || typeof email !== "string") {
  //   return res.json({ status: "error", error: "Ingresa un Email" });
  // }
  // if (!phone || typeof phone !== "string") {
  //   return res.json({ status: "error", error: "Ingresa un Telefono" });
  // }
  const emailVerify = await User.findOne({ email: email });
  if (emailVerify) {
    return res.json({ status: 403, error: "Este email ya existe" });
  }
  //console.log(req.headers.authorization);
  try {
    const _id = req.userData.id;
    //console.log(_id);
    await User.updateOne(
      { _id },
      {
        $set: { email: email, phone: phone },
      }
    );
    res.json({ status: 201, message: "successfully" });
  } catch (error) {
    console.log(error);
    res.json({ status: 400, error: ";))" });
  }
});

app.post("/fmunefm/change-password", async (req, res) => {
  const { token, newpassword: plainTextPassword } = req.body;

  if (!plainTextPassword || typeof plainTextPassword !== "string") {
    return res.json({ status: "error", error: "Invalid password" });
  }

  if (plainTextPassword.length < 8) {
    return res.json({
      status: "error",
      error: "Password too small. Should be atleast 8 characters",
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
    res.json({ status: 201, message: "successfully" });
  } catch (error) {
    console.log(error);
    res.json({ status: 400, error: ";))" });
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
  if (user.status === false) {
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
      expiresIn: 60 * 60 * 6, // seconds
    }
  );

  return res.json({ status: 202, data: token, role: user.role });

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
    phone,
    registrationDate,
  } = req.body;

  if (!email || !isValidEmail(email)) {
    return res.json({ status: 400, error: "Introduce un Email valido" });
  }

  if (plainTextPassword.length < 8) {
    return res.json({
      status: 400,
      error: "Introduce una Contraseña mayor a 8 digitos",
    });
  }
  const idCardVerify = await User.findOne({ idCard: idCard });
  if (idCardVerify) {
    return res.json({ status: 400, error: "Esta cedula ya existe" });
  }
  const idEmailVerify = await User.findOne({ email: email });
  if (idEmailVerify) {
    return res.json({ status: 400, error: "Este email ya existe" });
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
      phone,
      registrationDate,
    });
    console.log("User created successfully", response);
  } catch (error) {
    if (error) {
      return res.json({ status: 400, error: "Llene todos los campos" });
    }
    throw error;
  }
  return res.json({ status: 201, messaje: "User created successfully" });
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
  //console.log(req.userData.id);
  try {
    const user = await User.findOne({ _id: req.userData.id }).populate(
      "beneficiaries.beneficiary"
    );

    res.status(200).json(user);
  } catch (error) {
    return res.status(401).json({ message: "no autorizado" });
  }
});

app.get("/fmunefm/consult", checkauth, async (req, res) => {
  console.log(req.userData.id);
  try {
    const Users = await User.find().populate("beneficiaries.beneficiary");
    const Beneficiaries = await Beneficiary.find().populate("userId.user");
    //const user = await User.find();
    //console.log("***", user);

    //console.log("beneficiaries", { Users, Beneficiaries });
    res.status(200).json({ Users, Beneficiaries });
  } catch (error) {
    return res.status(401).json({ message: "no autorizado" });
  }
});

app.get("/fmunefm/consultationspending", checkauth, async (req, res) => {
  console.log("*****************", req.headers.role);
  let object = {};
  if (req.headers.role === "fRmEuCnEePfCmION") {
    object = { status: "Pendiente" };
  }
  if (req.headers.role === "MEfDImCOuGEnNEeRfAmL") {
    object = { status: "Pendiente", queryType: "GENERAL" };
  }
  try {
    const consultations = await MedicalConsultation.find(object)
      .populate("patient")
      .populate("user");

    //const user = await User.find();
    //console.log("***", user);

    console.log("beneficiaries", consultations);
    res.status(200).json(consultations);
  } catch (error) {
    return res.status(401).json({ message: "no autorizado" });
  }
});

app.post("/fmunefm/beneficiary/register", checkauth, async (req, res) => {
  ///console.log("****", req);
  const { documentType, idCard, name, lastName, relationship, sex, dateBirth } =
    req.body;

  const BeneficiaryVerify = await Beneficiary.findOne({
    idCard: idCard,
  });
  if (BeneficiaryVerify) {
    await Beneficiary.findByIdAndUpdate(
      { _id: BeneficiaryVerify._id },
      {
        $addToSet: {
          userId: [
            {
              user: mongoose.Types.ObjectId(req.userData.id),
              relationship: relationship,
            },
          ],
        },
      },
      { new: true }
    );
    await User.findByIdAndUpdate(
      { _id: req.userData.id },
      {
        $addToSet: {
          beneficiaries: [
            {
              beneficiary: mongoose.Types.ObjectId(BeneficiaryVerify._id),
              relationship: relationship,
            },
          ],
        },
      },
      { new: true }
    );
    return res.status(200).json(BeneficiaryVerify);
  }

  if (idCard === req.userData.idCard) {
    return res.status(401).send({
      success: false,
      error: "Eres titular no te puedes agregar a tu propia carga familiar",
    });
  }

  try {
    // const idCardVerify = await Beneficiary.findOne({
    //   userId: req.userData.id,
    //   idCard: req.body.idCard,
    // });

    // if (idCardVerify) {
    //   return res.status(402).send({
    //     success: false,
    //     error: "Ya tienes Este Miembro en tu carga familiar",
    //   });
    // } else {
    console.log("try ", req.body);
    const response = await Beneficiary.create({
      documentType,
      idCard,
      name,
      lastName,
      sex,
      dateBirth,
      userId: [{ user: req.userData.id, relationship: relationship }],
    });
    console.log("despues de response", response);
    await User.findByIdAndUpdate(
      { _id: req.userData.id },
      {
        $addToSet: {
          beneficiaries: {
            beneficiary: mongoose.Types.ObjectId(response._id),
            relationship: relationship,
          },
        },
      },
      { new: true }
    );
    console.log("User created successfully: ", response);
    return res
      .status(200)
      .json({ beneficiary: response, relationship: relationship });
    // }
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

app.delete("/beneficiary/delete/:idCard", checkauth, async (req, res) => {
  //console.log(req.headers, "hola");
  const { idCard } = req.params;
  try {
    console.log(`han solicitado un .DELETE para la cedula:${idCard}`);
    const infoBorrado = await Beneficiary.find({ idCard: idCard });
    await Beneficiary.findOneAndDelete({ idCard: idCard });

    console.log(`Se ha borrado con exito la informacion ${infoBorrado}`);
    res.status(202).end();
  } catch (error) {
    console.log("ha fallado el .DELETE, respondiendo con un statusCode: 400");
    res.status(400).end();
  }
});

const server = app.listen(process.env.PORT, () => {
  console.log(`Server up at ${process.env.PORT}`);
});

const io = SocketIo(server);

//Funcionalidad de socket.io en el servidor
io.on("connection", (socket) => {
  let nombre;
  console.log("usuario conectado");

  socket.on("connected", (hola) => {
    console.log("usuario conec", hola);
  });

  // registro de nueva consulta///////////////////////////////////////////////////////////////
  socket.on("service", async (NewService, id) => {
    //console.log("servicio", NewService);
    const { patientIdCard, patientType, queryType, user } = NewService;
    if (user === null && patientType === "Titular") {
      const patientData = await User.findOne({
        idCard: patientIdCard,
      });
      if (
        patientIdCard === null ||
        patientType === null ||
        queryType === null
      ) {
        return socket.emit(
          "error",
          "No puedes realizar mas de dos consultas por año"
        );
      }
      // const consultations = await MedicalConsultation.find({
      //   idCardPatient: patientData.idCard,
      //   user: patientData._id,
      // });
      // let consultationsPerYear = 0;
      // consultations.map((el) => {
      //   if (el.registrationDate.getFullYear() === new Date().getFullYear()) {
      //     consultationsPerYear++;
      //   }
      // });
      // console.log(consultationsPerYear);
      // console.log(consultations.length);
      // if (consultations.length >= 2 && consultationsPerYear >= 2) {
      //   return socket.emit(
      //     "services",
      //     "No puedes realizar mas de dos consultas por año"
      //   );
      // }
      try {
        const response = await MedicalConsultation.create({
          patient: patientData._id,
          idCardPatient: patientData.idCard,
          patientType,
          queryType,
          user: patientData._id,
        });

        await User.findByIdAndUpdate(
          { _id: patientData._id },
          {
            $addToSet: {
              medicalConsultations: mongoose.Types.ObjectId(response._id),
            },
          },
          { new: true }
        );
        console.log("User created successfully: ", response);
        let role =
          queryType === "GENERAL"
            ? "MEfDImCOuGEnNEeRfAmL"
            : "MEfDImCOuEMnEReGEfNCmIA";
        const consultations = await MedicalConsultation.find({
          status: "Pendiente",
        })
          .populate("patient")
          .populate("user");
        io.emit(id, consultations);
        io.emit(role, consultations);
      } catch (error) {
        console.log("cath", error);
        if (error) {
          return io.emit("error", "Ocurrio un problema");
        }
      }
    } else {
      const patientData = await Beneficiary.findOne({
        idCard: patientIdCard,
      });
      if (
        patientIdCard === null ||
        patientType === null ||
        queryType === null ||
        user === null
      ) {
        return socket.emit("error", "Faltan datos, por favor verifique");
      }

      try {
        const response = await MedicalConsultation.create({
          patient: patientData._id,
          idCardPatient: patientData.idCard,
          patientType,
          queryType,
          user: user,
        });

        await Beneficiary.findByIdAndUpdate(
          { _id: patientData._id },
          {
            $addToSet: {
              medicalConsultations: mongoose.Types.ObjectId(response._id),
            },
          },
          { new: true }
        );
        console.log("User created successfully: ", response);
        const consultations = await MedicalConsultation.find({
          status: "Pendiente",
        })
          .populate("patient")
          .populate("user");
        io.emit("services", consultations);
      } catch (error) {
        console.log("cath", error);
        if (error) {
          return io.emit("error", "Ocurrio un problema");
        }
      }
    }
  });

  //Funcionalidad de socket.io en el servidor
  // io.on("connection", (socket) => {
  //   let nombre;

  //   socket.on("connect", (nomb) => {
  //     nombre = nomb;
  //     //socket.broadcast.emit manda el mensaje a todos los clientes excepto al que ha enviado el mensaje
  //     socket.broadcast.emit("mensajes", {
  //       nombre: nombre,
  //       mensaje: `${nombre} ha entrado en la sala del chat`,
  //     });
  //   });

  //   socket.on("mensaje", (nombre, mensaje) => {
  //     //io.emit manda el mensaje a todos los clientes conectados al chat
  //     io.emit("mensajes", { nombre, mensaje });
  //   });

  //   socket.on("disconnect", () => {
  //     io.emit("mensajes", {
  //       servidor: "Servidor",
  //       mensaje: `${nombre} ha abandonado la sala`,
  //     });
  //   });
  // });
});
