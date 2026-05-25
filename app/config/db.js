const mysql = require("mysql2");

const pool = mysql.createPool({
  host:             process.env.DB_HOST     || "mysql",
  user:             process.env.DB_USER     || "root",
  password:         process.env.DB_PASSWORD || "1234",
  database:         process.env.DB_NAME     || "maquinas_db",
  waitForConnections: true,
  connectionLimit:  10,
  queueLimit:       0,
});

pool.getConnection((err, connection) => {
  if (err) {
    console.error("Error conectando a MySQL:", err);
  } else {
    console.log("Conectado a MySQL");
    connection.release();
  }
});

module.exports = pool;
