import express from "express";
import path from "path";
import { fileURLToPath } from "url";

// Fix para __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import { methods as authentication } from "./controllers/authentication.controller.js";
import { json } from "stream/consumers";

// Server
const app = express();
app.set("port", 4000);

app.listen(app.get("port"), () => {
  console.log("Servidor corriendo en puerto", app.get("port"));
});


// Rutas
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public", "login.html"));
  res.sendFile(path.join(__dirname, "../public", "login.html"));
});

//configuracion
app.use(express.static(path.join(__dirname, "../public")));
app.use(express.json());

// Rutas API
app.post("/api/login", authentication.login);
app.post("/api/register", authentication.register);