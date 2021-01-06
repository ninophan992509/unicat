module.exports = function auth(req, res, next) {
  if (req.session.isAuth === false || +req.session.role !== 1) {
    req.session.retUrl = req.originalUrl;
    return res.redirect("/teacher/login");
  }
  next();
};
