const bcrypt  = require("bcryptjs");
const Usuario = require("../models/usuario.model");

exports.login = (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ message: "Credenciales requeridas" });

  Usuario.findByUsername(username, async (err, user) => {
    if (err || !user)
      return res.status(401).json({ message: "Usuario o contraseña incorrectos" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid)
      return res.status(401).json({ message: "Usuario o contraseña incorrectos" });

    req.session.user = { id: user.id, username: user.username, rol: user.rol };
    res.json({ rol: user.rol });
  });
};

exports.logout = (req, res) => {
  req.session.destroy(() => res.json({ message: "Sesión cerrada" }));
};

exports.me = (req, res) => {
  if (!req.session.user)
    return res.status(401).json({ message: "No autenticado" });
  res.json(req.session.user);
};
