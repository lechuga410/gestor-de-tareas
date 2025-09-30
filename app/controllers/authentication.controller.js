async function register(req, res) {
  try {
    console.log(req.body); // aquí ves user, email, password
    const fullName = req.body.fullName;
    const user = req.body.user;
    const password = req.body.password;
    const confirm_password = req.body.confirmPassword;
    const email = req.body.email;
    if(!fullName || !user || !password || !confirm_password || !email){
      return res.status(400).send({status:"error",message:"los campos estan incompletos."})
    }
    res.json({ ok: true }); // para que el frontend sepa que todo salió bien
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Algo falló en el servidor" });
  }
}

async function login(req, res) {
  try {
    console.log(req.body);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Algo falló en el servidor" });
  }
}

export const methods = {
  login,
  register
};
