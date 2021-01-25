var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

//router files
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var stripeRouter = require('./routes/stripe')

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//routes
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/api/v1/stripe', stripeRouter);

module.exports = app;
