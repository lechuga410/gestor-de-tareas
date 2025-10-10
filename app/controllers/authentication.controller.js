import connection from "../index.js";
import bcrypt from "bcryptjs"; // Asegúrate de tener bcryptjs instalado

export async function register(req, res) {
  try {
    const { fullName, user, email, password, confirmPassword } = req.body;

    if (!fullName || !user || !email || !password || !confirmPassword) {
      return res.status(400).json({ status: "error", message: "Los campos están incompletos." });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ status: "error", message: "Las contraseñas no coinciden." });
    }

    // 🔹 Verificar si el usuario o email ya existe
    const checkQuery = "SELECT * FROM usuarios WHERE user = ? OR email = ?";
    connection.query(checkQuery, [user, email], async (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: "Error consultando la base de datos" });
      }

      if (results.length > 0) {
        return res.status(400).json({ message: "Usuario o email ya registrado" });
      }

      // 🔹 Hashear la contraseña antes de guardar
      const hashedPassword = await bcrypt.hash(password, 10);

      // 🔹 Insertar nuevo usuario
      const insertQuery = "INSERT INTO usuarios (fullName, user, email, password) VALUES (?, ?, ?, ?)";
      connection.query(insertQuery, [fullName, user, email, hashedPassword], (err2) => {
        if (err2) {
          console.error(err2);
          return res.status(500).json({ message: "Error guardando en la base de datos" });
        }
        res.json({ message: "Usuario registrado correctamente" });
        
      });
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Algo falló en el servidor" });
  }
}

export async function login(req, res) {
  const { fullName, password } = req.body;

  if (!fullName || !password) {
    return res.json({ ok: false });
  }

  const query = "SELECT * FROM usuarios WHERE user = ? OR email = ?";
  connection.query(query, [fullName, fullName], async (err, results) => {
    if (err) {
      console.error(err);
      return res.json({ ok: false });
    }

    if (results.length === 0) {
      return res.json({ ok: false });
    }

    const user = results[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.json({ ok: false });
    }

    // Login correcto
    return res.json({ ok: true });
  });
}

export async function updateName(req, res){
  try{
    const { email, newName } = req.body;
    if(!email || !newName) return res.status(400).json({ status:'error', message:'Faltan datos' });
    const q = 'UPDATE usuarios SET fullName = ? WHERE email = ?';
    connection.query(q, [newName, email], (err, result)=>{
      if(err){ console.error(err); return res.status(500).json({ status:'error', message:'Db error' }); }
      return res.json({ ok:true, message:'Nombre actualizado' });
    });
  }catch(e){ console.error(e); res.status(500).json({ status:'error' }); }
}

export async function updateEmail(req, res){
  try{
    const { email, newEmail } = req.body;
    if(!email || !newEmail) return res.status(400).json({ status:'error', message:'Faltan datos' });
    // check new email not used
    const check = 'SELECT id FROM usuarios WHERE email = ?';
    connection.query(check, [newEmail], (err, rows)=>{
      if(err){ console.error(err); return res.status(500).json({ status:'error' }); }
      if(rows.length>0) return res.status(400).json({ status:'error', message:'Email ya en uso' });
      const q = 'UPDATE usuarios SET email = ? WHERE email = ?';
      connection.query(q, [newEmail, email], (err2)=>{
        if(err2){ console.error(err2); return res.status(500).json({ status:'error' }); }
        return res.json({ ok:true, message:'Email actualizado' });
      });
    });
  }catch(e){ console.error(e); res.status(500).json({ status:'error' }); }
}

export async function updatePassword(req, res){
  try{
    const { email, currentPassword, newPassword } = req.body;
    if(!email || !currentPassword || !newPassword) return res.status(400).json({ status:'error', message:'Faltan datos' });
    const q = 'SELECT * FROM usuarios WHERE email = ?';
    connection.query(q, [email], async (err, results)=>{
      if(err){ console.error(err); return res.status(500).json({ status:'error' }); }
      if(results.length===0) return res.status(404).json({ status:'error', message:'Usuario no encontrado' });
      const user = results[0];
      const match = await bcrypt.compare(currentPassword, user.password);
      if(!match) return res.status(400).json({ status:'error', message:'Contraseña actual incorrecta' });
      const hashed = await bcrypt.hash(newPassword, 10);
      const up = 'UPDATE usuarios SET password = ? WHERE email = ?';
      connection.query(up, [hashed, email], (err2)=>{
        if(err2){ console.error(err2); return res.status(500).json({ status:'error' }); }
        return res.json({ ok:true, message:'Contraseña actualizada' });
      });
    });
  }catch(e){ console.error(e); res.status(500).json({ status:'error' }); }
}
