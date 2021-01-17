const createError = require("http-errors");
const express = require("express");
require("express-async-errors");
const exphbs = require("express-handlebars");
const hbs_sections = require("express-handlebars-sections");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const numeral = require("numeral");
const moment = require("moment");
const app = express();
require("dotenv").config();

app.use(express.static(path.join(__dirname, "public")));
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "hbs");
app.engine(
  "hbs",
  exphbs({
    defaultLayout: "main.hbs",
    extname: ".hbs",
    layoutsDir: __dirname + "/views/layouts",
    partialsDir: __dirname + "/views/partials",
    helpers: {
      section: hbs_sections(),
      roundRating(point) {
        return (Math.round(+point * 100) / 100).toFixed(1);
      },
      format(val) {
        return numeral(val).format("0,0");
      },
      setRatingValue(point, width) {
        const urPoint = (Math.round(+point * 100) / 100).toFixed(1) / 5;
        const rPoint = (Math.round(urPoint * 100) / 100) * width;
        return rPoint;
      },
      eq(id1, id2, opts) {
        if (id1 === id2) {
          return opts.fn(this);
        } else {
          return opts.inverse(this);
        }
      },
      formatDateTime(datetime) {
        moment.locale("vi");
        moment.suppressDeprecationWarnings = true;
        return moment(`${datetime}`).fromNow();
      },
      formatDOB(datetime) {
        const date = new Date(`${datetime}`);
        return moment(date).format("DD-MM-YYYY");
      },
      json(context) {
        return JSON.stringify(context);
      },
      math(lvalue, operator, rvalue, options) {
        lvalue = parseFloat(lvalue);
        rvalue = parseFloat(rvalue);

        return {
          "+": lvalue + rvalue,
          "-": lvalue - rvalue,
          "*": lvalue * rvalue,
          "/": lvalue / rvalue,
          "%": lvalue % rvalue,
        }[operator];
      },
    },
  })
);
const auth = require("./middlewares/auth.mdw");
const passport = require("./auth/social-strategy");
app.use(passport.initialize());
app.use(passport.session());

require("./middlewares/session.mdw")(app);

require("./middlewares/locals-admin.mdw")(app);
app.use("/admin", require("./routes/routeAdmin/admin.route"));
app.use("/admin/manage-categories", require("./routes/routeAdmin/cat.route"));
app.use("/admin/manage-teachers", require("./routes/routeAdmin/teacher.route"));
app.use("/admin/manage-students", require("./routes/routeAdmin/students.route"));
app.use("/admin/manage-courses", require("./routes/routeAdmin/course.route"));

require("./middlewares/locals-teacher.mdw")(app);
app.use("/teacherpage", require("./routes/routeTeacher/account.route"));
app.use("/teacherpage/courses", require("./routes/routeTeacher/course.route"));

require("./middlewares/locals.mdw")(app);
app.use("/", require("./routes/app.route.js"));
app.use("/auth",require("./routes/auth.route"));
app.use("/courses",require("./routes/course.route.js"));
app.use("/account", require("./routes/account.route"));
app.use("/cart", auth, require("./routes/cart.route"));
app.use("/mycourses", auth, require("./routes/my-account.route"));

// catch 404 and forward to error handler
app.use(function (req, res) {
  res.render("404", {
    layout: false,
  });
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  console.log(err);
  res.render("500", {
    layout: false,
  });
});

module.exports = app;
