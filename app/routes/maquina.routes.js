module.exports = app => {
  const maquinas                  = require("../controllers/maquina.controller");
  const { requireAuth, requireAdmin } = require("../middleware/auth");

  app.get("/maquinas",                 requireAuth,  maquinas.findAll);
  app.post("/maquinas",                requireAdmin, maquinas.create);
  app.get("/maquinas/:id",             requireAuth,  maquinas.findOne);
  app.put("/maquinas/:id",             requireAdmin, maquinas.update);
  app.patch("/maquinas/:id/estado",    requireAuth,  maquinas.updateEstado);
  app.delete("/maquinas/:id",          requireAdmin, maquinas.delete);
};
