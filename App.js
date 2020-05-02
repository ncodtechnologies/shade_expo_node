var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var invoiceRouter = require('./routes/invoice');
var productRouter = require('./routes/product');
var payrollRouter = require('./routes/payroll');
var accountsRouter = require('./routes/accounts');
var purchaseRouter = require('./routes/purchase');
var mysql = require('mysql')

const db = mysql.createConnection ({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'shade_app',
  port: 3306
});

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

global.db = db;

app.use('/', indexRouter);
app.use('/invoice', invoiceRouter);
app.use('/product', productRouter);
app.use('/payroll', payrollRouter);
app.use('/accounts', accountsRouter);
app.use('/purchase', purchaseRouter);

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
