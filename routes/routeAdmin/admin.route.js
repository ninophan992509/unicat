const express = require("express");
const auth = require("../../middlewares/auth-admin.mdw");
const router = express.Router();
const accountModel = require("../../models/account.model");
const bcrypt = require("bcryptjs");

router.get("/", auth, function (req, res) {
  res.render("vwAdminPages/home", {
    layout: "main-admin",
    title: "Dashboard",
  });
});

/* GET login page. */
router.get("/login", function (req, res) {
  if (req.session.isAuth && +req.session.role === 0) res.redirect("/admin");
  if (req.headers.referer) {
    if (!req.headers.referer.toString().includes("login")) {
      req.session.retUrl = req.headers.referer;
    } else {
      req.session.retUrl = null;
    }
  }
  res.render("vwAdminPages/vwAccount/login", {
    layout: false,
  });
});

router.post("/login", async function (req, res) {
  const user = await accountModel.singleByEmail(req.body.email);
  if (user === null || +user.Role !== 0) {
    return res.render("vwAdminPages/vwAccount/login", {
      layout: false,
      err_message: "Tài khoản không tồn tại!",
    });
  }

  const ret = bcrypt.compareSync(req.body.password, user.Password);
  if (ret === false) {
    return res.render("vwAdminPages/vwAccount/login", {
      layout: false,
      err_message: "Email hoặc mật khẩu sai!",
    });
  }

  req.session.isAuth = true;
  req.session.authUser = user.AccID;
  req.session.role = user.Role;
  let url = req.session.retUrl || "/admin";
  res.redirect(url);
});

router.post("/logout", auth, async function (req, res) {
  req.session.isAuth = false;
  req.session.authUser = null;
  res.redirect(req.headers.referer);
});

router.post("/lock-account", auth, async function (req, res) {
  try {
    const AccID = +req.body.account;
    const isLock = +req.body.status === 0 ? true : false;
    const entity = {
      AccID,
      isLock,
    };
    await accountModel.lock(entity);
    res.redirect(req.headers.referer);
  } catch (error) {
    throw error;
  }
});


module.exports = router;
