var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors');

var loginRouter = require('./routes/login');
var indexRouter = require('./routes/index');
var invoiceRouter = require('./routes/invoice');
var productRouter = require('./routes/product');
var payrollRouter = require('./routes/payroll');
var accountsRouter = require('./routes/accounts');
var purchaseRouter = require('./routes/purchase');
var salesRouter = require('./routes/sales');
var notificationRouter = require('./routes/notification');
var syncRouter = require('./routes/sync');
var statementRouter = require('./routes/statement');

var mysql = require('mysql');
const { stat } = require('fs');

var db = mysql.createConnection ({
  host: 'localhost',
  user: 'root',
  password: 'Nc0d#Mysql',
  database: 'shade_app',
  port: 3306
});

var app = express();

// view engine setup'0
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/:year/*',function (req, res, next) {
  console.log('Request Type:', req.params.year)
  const db_name = req.params.year == "2020" ? "shade_app" : `shade_app_${req.params.year}`
  var db = mysql.createConnection ({
    host: 'localhost',
    user: 'root',
    password: 'Nc0d#Mysql',
    database: db_name,
    port: 3306
  });
  global.db = db;
  global.db_name = db_name;
  next()
})


app.use('/:year', indexRouter);
app.use('/:year/login', loginRouter);
app.use('/:year/invoice', invoiceRouter);
app.use('/:year/product', productRouter);
app.use('/:year/payroll', payrollRouter);
app.use('/:year/accounts', accountsRouter);
app.use('/:year/purchase', purchaseRouter);
app.use('/:year/sales', salesRouter);
app.use('/:year/notification', notificationRouter);
app.use('/:year/sync', syncRouter);
app.use('/:year/statement', statementRouter);

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
