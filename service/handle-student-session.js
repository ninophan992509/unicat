module.exports = (req, res) =>{
  if (req.user.isLock === 0) {
    req.session.isAuth = true;
    req.session.authUser = req.user.AccID;
    req.session.role = req.user.Role;
    req.session.cart = [];
    let url = req.session.retUrl || "/";
    res.redirect(url);
  } else {
    res.render("vwAccount/login", {
      layout: false,
      err_message: "Tài khoản của bạn đang bị khóa!",
    });
  }
};