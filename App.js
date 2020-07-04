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
var notificationRouter = require('./routes/notification');
var syncRouter = require('./routes/sync');
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

app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

global.db = db;

app.use('/', indexRouter);
app.use('/login', loginRouter);
app.use('/invoice', invoiceRouter);
app.use('/product', productRouter);
app.use('/payroll', payrollRouter);
app.use('/accounts', accountsRouter);
app.use('/purchase', purchaseRouter);
app.use('/notification', notificationRouter);
app.use('/sync', syncRouter);

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
