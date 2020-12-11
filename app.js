const createError = require('http-errors');
const express = require('express');
require('express-async-errors');
const exphbs = require('express-handlebars');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const numeral = require('numeral');



const app = express();

app.use(express.static(path.join(__dirname, 'public')));
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.engine('hbs',exphbs({
  defaultLayout: 'main.hbs',
  extname: '.hbs',
  layoutsDir: __dirname + '/views/layouts',
  partialsDir: __dirname + '/views/partials',
  helpers:{
      roundRating(point) {
          return (Math.round(+point * 100)/100).toFixed(1);
      },
      format(val) {
        return numeral(val).format('0,0');
      },
       setRatingValue(point) {
        const urPoint = (Math.round(+point * 100)/100).toFixed(1) / 5;
        const rPoint  =  (Math.round(urPoint * 100)/100)*70;
        return rPoint;
      }
  }
}));




app.use(require('./middlewares/locals.mdw'));
app.use('/',require('./routes/app.route.js'));
app.use('/courses',require('./routes/courses.route.js'));
app.use('/course',require('./routes/course.route.js'));
app.use('/users',require('./routes/users.js'));


// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  console.log(err);
  res.render('500',{
    layout:false
  });

});

// catch 404 and forward to error handler
app.use(function(req, res) {
  res.render('404', {
    layout: false
  });
});

module.exports = app;
