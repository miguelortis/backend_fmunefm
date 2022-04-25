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
//////////import socket////////////////
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
    return res.json({
      status: 204,
      error: "Este usuario no se encuentra registrado",
    });
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
      expiresIn: 60 * 60 * 24, // seconds
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
  //console.log(req.userData.id);
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

// app.get("/fmunefm/consultationspending", checkauth, async (req, res) => {
//   //console.log("*****************", req.headers.role);
//   let object = {};
//   if (req.headers.role === "fRmEuCnEePfCmION") {
//     object = { status: "Pendiente" };
//   }
//   if (req.headers.role === "MEfDImCOuGEnNEeRfAmL") {
//     object = { status: "Pendiente", queryType: "GENERAL" };
//   }
//   try {
//     const consultations = await MedicalConsultation.find(object)
//       .populate("patient")
//       .populate("user");

//     //const user = await User.find();
//     //console.log("***", user);

//     //console.log("beneficiaries", consultations);
//     res.status(200).json(consultations);
//   } catch (error) {
//     return res.status(401).json({ message: "no autorizado" });
//   }
// });

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
    //console.log("try ", req.body);
    const response = await Beneficiary.create({
      documentType,
      idCard,
      name,
      lastName,
      sex,
      dateBirth,
      userId: [{ user: req.userData.id, relationship: relationship }],
    });
    //console.log("despues de response", response);
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

////////////////////////////SOCKETS////////////////////////////////////////////

const io = SocketIo(server, {
  cors: {
    origin: "https://fmunefm.vercel.app/",
    methods: ["GET", "POST"],
  },
});

let users = [];

const addUser = (userId, userRole, socketId) => {
  !users.some((user) => user.userId === userId) &&
    users.push({ userId, userRole, socketId });
};

const removeUser = (socketId) => {
  users = users.filter((user) => user.socketId !== socketId);
};

const getUser = (userId) => {
  return users.find((user) => user.userId === userId);
};
const getDoctorUser = (userRole) => {
  return users.find((user) => user.userRole === userRole);
};
io.on("connection", (socket) => {
  //when ceonnect
  console.log("a user connected.");
  console.log(users);

  //take userId and socketId from user
  socket.on("addUser", async (userId, userRole) => {
    addUser(userId, userRole, socket.id);
    io.emit("getUsers", users);
    //verificar tipo de rol y mandar consultas pendientes
    if (userRole === "fRmEuCnEePfCmION") {
      const pendingConsultations = await MedicalConsultation.find({
        status: "Pendiente",
      })
        .populate("patient")
        .populate("user");
      io.emit(userRole, pendingConsultations);
    }
    if (userRole === "MEfDImCOuGEnNEeRfAmL") {
      const pendingConsultations = await MedicalConsultation.find({
        status: "Pendiente",
        queryType: "GENERAL",
      })
        .populate("patient")
        .populate("user");
      io.emit(userRole, pendingConsultations);
    }
    if (userRole === "MEfDImCOuEMnEReGEfNCmIA") {
      const pendingConsultations = await MedicalConsultation.find({
        status: "Pendiente",
        queryType: "EMERGENCIA",
      })
        .populate("patient")
        .populate("user");
      io.emit(userRole, pendingConsultations);
    }
  });

  //guardar y enviar consultas pendientes
  socket.on("service", async (consultation) => {
    console.log("service", consultation);

    const { patientIdCard, patientType, queryType, user } = consultation;

    let patientData;
    if (patientType === "Titular") {
      patientData = await User.findOne({
        idCard: patientIdCard,
      });
    }
    if (patientType === "Beneficiario") {
      patientData = await Beneficiary.findOne({
        idCard: patientIdCard,
      });
    }

    try {
      const response = await MedicalConsultation.create({
        patient: patientData._id,
        idCardPatient: patientData.idCard,
        patientType,
        queryType,
        user: patientType === "Titular" ? patientData._id : user,
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
      //////Enviar todas las consultas a recepcion
      const allPendingConsultations = await MedicalConsultation.find({
        status: "Pendiente",
      })
        .populate("patient")
        .populate("user");
      io.emit("services", allPendingConsultations);
      //////////Enviar todas las consultas de Emergencia al "doctor de Emergencia"
      if (consultation?.queryType === "EMERGENCIA") {
        const user = getDoctorUser("MEfDImCOuEMnEReGEfNCmIA");
        const pendingConsultations = await MedicalConsultation.find({
          status: "Pendiente",
          queryType: "EMERGENCIA",
        })
          .populate("patient")
          .populate("user");
        io.to(user?.socketId).emit("consultations", pendingConsultations);
      }
      //////////Enviar todas las consultas General al "doctor General"
      if (consultation?.queryType === "GENERAL") {
        const user = getDoctorUser("MEfDImCOuGEnNEeRfAmL");
        const pendingConsultations = await MedicalConsultation.find({
          status: "Pendiente",
          queryType: "GENERAL",
        })
          .populate("patient")
          .populate("user");
        io.to(user?.socketId).emit("consultations", pendingConsultations);
      }
    } catch (error) {
      console.log("cath", error);
      if (error) {
        return io.emit("error", "Ocurrio un Error con el servidor");
      }
    }
  });

  //send and get message
  socket.on("sendMessage", ({ senderId, receiverId, text }) => {
    const user = getUser(receiverId);
    io.to(user.socketId).emit("getMessage", {
      senderId,
      text,
    });
  });

  //when disconnect
  socket.on("disconnect", () => {
    console.log("a user disconnected!");
    removeUser(socket.id);
    io.emit("getUsers", users);
  });
});
