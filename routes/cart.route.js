const express = require("express");
const moment = require("moment");
const cartModel = require("../models/cart.model");
const courseModel = require("../models/course.model");
const studentCourseModel = require("../models/student-course.model");
const ordersModel = require("../models/orders.model");
const orderDetailModel = require("../models/order-detail.model");
const router = express.Router();
const active = require("../middlewares/active.mdw");

router.get("/", active, async function (req, res) {
  const items = [];
  const cart = req.session.cart;
  let total = 0;
  for (const ci of Object.values(cart)) {
    const course = await courseModel.single(ci.id);
    items.push({
      ...ci,
      course,
      amount: course.CourPrice,
    });
    total += course.CourPrice;
  }

  res.render("vwCart/index", {
    items,
    total,
    empty: req.session.cart.length === 0,
  });
});

router.post("/add", function (req, res) {
  const item = {
    id: +req.body.id,
  };
  cartModel.add(req.session.cart, item);
  //res.redirect(req.headers.referer);
  res.json({ cartQuantity: req.session.cart.length });
});

router.post("/remove", function (req, res) {
  cartModel.del(req.session.cart, +req.body.id);
  res.redirect(req.headers.referer);
});

router.get("/is-bought", async function (req, res) {
  const CourID = +req.query.courID;
  const StdID = +res.locals.user.Id;

  const row = await studentCourseModel.singleByCourIDAndStdID(CourID, StdID);
  if (row === null) {
    return res.json(false);
  }
  res.json(true);
});

router.post("/checkout",active,async function (req, res) {
  const details = [];
  let total = 0;
  const cart = req.session.cart;
  for (const ci of Object.values(cart)) {
    const course = await courseModel.single(ci.id);
    const newCour = {
      StdID: res.locals.user.Id,
      CourID: ci.id,
    };
    await studentCourseModel.add(newCour);
    const amount = course.CourPrice;
    total += amount;

    details.push({
      CourID: course.CourID,
      CourPrice: course.CourPrice,
      Amount: amount,
    });
  }

  const order = {
    StdID: res.locals.user.Id,
    Total: total,
  };

  const OrderID = await ordersModel.add(order);

  for (const detail of details) {
    detail.OrderID = +OrderID;
    await orderDetailModel.add(detail);
  }

  req.session.cart = [];
  res.redirect("/account/profile#list-my-courses");
});

module.exports = router;
