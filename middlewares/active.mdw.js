const studentModel = require("../models/student.model");
module.exports = async (req, res, next) => {
  if (req.session.isAuth && req.session.authUser) {
    const student = await studentModel.singleByAccID(req.session.authUser);
    if (student && student.ActiveCode !== null) {
      return res.redirect("/account/active");
    }
  }
  next();
};
