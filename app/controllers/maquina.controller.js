// app/controllers/maquina.controller.js
const Maquina = require("../models/maquina.model");

// Obtener todas las máquinas
exports.findAll = (req, res) => {
  Maquina.getAll((err, data) => {
    if (err) res.status(500).send(err);
    else res.send(data);
  });
};

// Crear máquina
exports.create = (req, res) => {
  if (!req.body) return res.status(400).send({ message: "El contenido no puede estar vacío" });

  const maquina = new Maquina(req.body);

  Maquina.create(maquina, (err, data) => {
    if (err) res.status(500).send(err);
    else res.send(data);
  });
};

// Obtener una máquina por ID
exports.findOne = (req, res) => {
  Maquina.findById(req.params.id, (err, data) => {
    if (err) {
      if (err.kind === "not_found") res.status(404).send({ message: `Máquina con id ${req.params.id} no encontrada` });
      else res.status(500).send(err);
    } else res.send(data);
  });
};

// Actualizar máquina
exports.update = (req, res) => {
  if (!req.body) return res.status(400).send({ message: "El contenido no puede estar vacío" });

  Maquina.updateById(req.params.id, new Maquina(req.body), (err, data) => {
    if (err) {
      if (err.kind === "not_found") res.status(404).send({ message: `Máquina con id ${req.params.id} no encontrada` });
      else res.status(500).send(err);
    } else res.send(data);
  });
};

// Actualizar solo el estado
exports.updateEstado = (req, res) => {
  const { estado } = req.body;
  if (!estado) return res.status(400).send({ message: "Estado requerido" });
  Maquina.updateEstado(req.params.id, estado, (err) => {
    if (err) res.status(500).send(err);
    else res.send({ message: "Estado actualizado" });
  });
};

// Eliminar máquina
exports.delete = (req, res) => {
  Maquina.remove(req.params.id, (err, data) => {
    if (err) {
      if (err.kind === "not_found") res.status(404).send({ message: `Máquina con id ${req.params.id} no encontrada` });
      else res.status(500).send(err);
    } else res.send({ message: "Máquina eliminada correctamente" });
  });
};