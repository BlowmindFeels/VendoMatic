const bcrypt = require("bcryptjs");
const sql    = require("./db");

module.exports = async function seed() {
  sql.query(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id       INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(50)  NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      rol      ENUM('admin','usuario') NOT NULL DEFAULT 'usuario'
    )
  `, async (err) => {
    if (err) return console.error("Error creando tabla usuarios:", err);

    const [adminHash, userHash] = await Promise.all([
      bcrypt.hash("admin123", 10),
      bcrypt.hash("user123",  10),
    ]);

    sql.query(
      `INSERT IGNORE INTO usuarios (username, password, rol) VALUES (?, ?, 'admin'), (?, ?, 'usuario')`,
      ["admin", adminHash, "usuario", userHash],
      (err) => { if (!err) console.log("Usuarios por defecto listos"); }
    );
  });
};
