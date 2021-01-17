module.exports = function auth(req, res, next) {
  if (req.session.isAuth === false || +req.session.role !== 0) {
    req.session.retUrl = req.originalUrl;
    return res.redirect("/admin/login");
  }
  next();
};
