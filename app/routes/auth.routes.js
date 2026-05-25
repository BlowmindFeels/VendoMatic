module.exports = app => {
  const auth = require("../controllers/auth.controller");
  app.post("/auth/login",  auth.login);
  app.post("/auth/logout", auth.logout);
  app.get("/auth/me",      auth.me);
};
