const sql = require("../config/db");

const Maquina = function(maquina) {
  this.nombre   = maquina.nombre;
  this.ubicacion = maquina.ubicacion;
  this.capacidad = maquina.capacidad;
  this.estado   = maquina.estado;
};

Maquina.create = (newMaquina, result) => {
  sql.query("INSERT INTO maquinas SET ?", newMaquina, (err, res) => {
    if (err) { result(err, null); return; }
    result(null, { id: res.insertId, ...newMaquina });
  });
};

Maquina.getAll = (result) => {
  sql.query("SELECT * FROM maquinas", (err, res) => {
    if (err) { result(err, null); return; }
    result(null, res);
  });
};

Maquina.findById = (id, result) => {
  sql.query("SELECT * FROM maquinas WHERE id = ?", [id], (err, res) => {
    if (err) { result(err, null); return; }
    result(null, res[0]);
  });
};

Maquina.updateById = (id, maquina, result) => {
  sql.query(
    "UPDATE maquinas SET nombre=?, ubicacion=?, capacidad=?, estado=? WHERE id=?",
    [maquina.nombre, maquina.ubicacion, maquina.capacidad, maquina.estado, id],
    (err, res) => {
      if (err) { result(err, null); return; }
      result(null, res);
    }
  );
};

Maquina.remove = (id, result) => {
  sql.query("DELETE FROM maquinas WHERE id=?", [id], (err, res) => {
    if (err) { result(err, null); return; }
    result(null, res);
  });
};

Maquina.updateEstado = (id, estado, result) => {
  sql.query("UPDATE maquinas SET estado=? WHERE id=?", [estado, id], (err, res) => {
    if (err) { result(err, null); return; }
    result(null, res);
  });
};

module.exports = Maquina;