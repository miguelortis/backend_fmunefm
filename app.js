const mongoose = require("mongoose");
const express = require("express");
require("dotenv").config();
const bodyParser = require("body-parser");
const _connect = require("./config/_connect");
const routes = require('./routes');
/////// cors ///////////////
const cors = require("cors");
//////////import socket////////////////
const SocketIo = require("socket.io");
///////import models
const User = require("./models/User");
const Beneficiary = require("./models/beneficiary");
const MedicalConsultation = require("./models/MedicalConsultation");
//const AccountsReceivableVerifier = require("./helpers/AccountsReceivableVerifier");
///////conxion con mongodb
_connect();

const app = express();
//app.use(cors('*'));
// Configurar cabeceras y cors
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE, PATCH');
  res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE, PATCH');
  next();
});
app.use(bodyParser.json());
app.use('/', routes)

const server = app.listen(process.env.PORT, () => {
  console.log(`Server up at ${process.env.PORT}`);
});

////////////////////////////SOCKETS////////////////////////////////////////////

const io = SocketIo(server);

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
    
    if (userRole?.options?.find(option => option.code === 5)) {
      const pendingConsultations = await MedicalConsultation.find({
        status: "Pendiente",
      })
        .populate("patient")
        .populate("user");
      io.emit(userRole, pendingConsultations);
    }
    if (userRole?.options?.find(option => option.code === 6)) {
      const pendingConsultations = await MedicalConsultation.find({
        status: "Pendiente",
        queryType: "GENERAL",
      })
        .populate("patient")
        .populate("user");
      io.emit(userRole, pendingConsultations);
    }
    if (userRole?.options?.find(option => option.code === 7)) {
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
  socket.on("consultation", async (consultation) => {
    console.log("consultation", consultation);

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
