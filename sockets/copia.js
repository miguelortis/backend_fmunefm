/Funcionalidad de socket.io en el servidor
io.on("connection", (socket) => {
  let nombre;
  console.log("usuario conectado");

  socket.on("connected", (hola) => {
    console.log("usuario conec", hola);
  });

  // registro de nueva consulta///////////////////////////////////////////////////////////////
  socket.on("service", async (NewService) => {
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
        const consultations = await MedicalConsultation.find({
          status: "Pendiente",
        })
          .populate("patient")
          .populate("user");
        socket.emit("services", consultations);
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
