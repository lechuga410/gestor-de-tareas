import express from "express";
import path from "path";
import { fileURLToPath } from "url";

// Fix para __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import * as authentication from "./controllers/authentication.controller.js";
import { json } from "stream/consumers";

// Server
const app = express();
app.set("port", 4000);

app.listen(app.get("port"), () => {
  console.log("Servidor corriendo en puerto", app.get("port"));
});


// Rutas
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public", "index.html"));
  res.sendFile(path.join(__dirname, "../public", "index.html"));
});

//configuracion
app.use(express.static(path.join(__dirname, "../public")));
app.use(express.json());

// Rutas API
app.post("/api/login", authentication.login);
app.post("/api/register", authentication.register);
app.post("/api/user/update-name", authentication.updateName);
app.post("/api/user/update-email", authentication.updateEmail);
app.post("/api/user/update-password", authentication.updatePassword);




//saber si el sql esta funcionando 
import mysql from "mysql2";

// Configura tu conexión según tus datos
const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "BaseDatos123",
  database: "mi_pagina"
});

// Intentar conectar y ver si da error
connection.connect((err) => {
  if (err) {
    console.error("Error conectando a la base de datos:", err.message);
  } else {
    console.log("Conectado a MySQL correctamente");
  }
});

export default connection;
