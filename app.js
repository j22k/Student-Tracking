var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session')
var db = require('./config/connection')
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var adminRouter = require('./routes/admin');
var studentRouter = require('./routes/student');
var facualtyRouter = require('./routes/facualty');
const { log } = require('console');
const fileUpload = require('express-fileupload');
const bodyParser = require('body-parser');
const Handlebars = require('handlebars');
var app = express();



// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(fileUpload());
app.use(bodyParser.json());
app.use(session({secret:"key",cookie:{maxAge:600000}}))

// db.connect((err)=>{
//   if(err) console.log("Connection Error "+err);
//   else console.log("Connection Succesfull");
//   if(state == null) console.log("connection unsuccsefull");
// })

db.connectToDatabase()


app.use('/', indexRouter)
app.use('/users', usersRouter);
app.use('/admin',adminRouter)
app.use('/student',studentRouter);
app.use('/facualty',facualtyRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
