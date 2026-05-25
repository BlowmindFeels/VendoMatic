const express = require("express");
const session = require("express-session");
const app     = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret:            "vm-expendedoras-secret",
  resave:            false,
  saveUninitialized: false,
  cookie:            { httpOnly: true, maxAge: 8 * 60 * 60 * 1000 },
}));

require("./app/config/seed")();
require("./app/routes/auth.routes")(app);

// Redirige / según rol
app.get("/", (req, res) => {
  if (!req.session.user) return res.redirect("/login.html");
  return req.session.user.rol === "admin"
    ? res.redirect("/index.html")
    : res.redirect("/selector.html");
});

// Protege páginas HTML antes de servirlas estáticamente
const PAGE_RULES = {
  "/index.html":    "admin",
  "/selector.html": "auth",
  "/maquina.html":  "auth",
};
app.use((req, res, next) => {
  const rule = PAGE_RULES[req.path];
  if (!rule) return next();
  if (!req.session.user) return res.redirect("/login.html");
  if (rule === "admin" && req.session.user.rol !== "admin")
    return res.redirect("/selector.html");
  next();
});

app.use(express.static("public", { index: false }));

require("./app/routes/maquina.routes")(app);

app.listen(3000, () => console.log("Servidor corriendo en puerto 3000"));
