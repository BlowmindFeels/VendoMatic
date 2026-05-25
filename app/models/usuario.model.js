const sql = require("../config/db");

const Usuario = {};

Usuario.findByUsername = (username, result) => {
  sql.query("SELECT * FROM usuarios WHERE username = ?", [username], (err, res) => {
    if (err) { result(err, null); return; }
    if (!res.length) { result({ kind: "not_found" }, null); return; }
    result(null, res[0]);
  });
};

module.exports = Usuario;
