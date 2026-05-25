const isApi = req =>
  req.path.startsWith("/maquinas") || req.path.startsWith("/auth");

exports.requireAuth = (req, res, next) => {
  if (!req.session.user)
    return isApi(req)
      ? res.status(401).json({ message: "No autenticado" })
      : res.redirect("/login.html");
  next();
};

exports.requireAdmin = (req, res, next) => {
  if (!req.session.user)
    return isApi(req)
      ? res.status(401).json({ message: "No autenticado" })
      : res.redirect("/login.html");
  if (req.session.user.rol !== "admin")
    return isApi(req)
      ? res.status(403).json({ message: "Acceso denegado" })
      : res.redirect("/selector.html");
  next();
};
