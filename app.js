var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var bodyParser = require('body-parser')



//router files
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var stripeRouter = require('./routes/stripe');
var talentsRouter = require('./routes/talents');
var profileRouter = require('./routes/profile');
var authRouter = require('./routes/auth_api');

var app = express();


app.use(logger('dev'));
// app.use(express.json());
// app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: false}));


//routes
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/api/v1/stripe', stripeRouter);
app.use('/talents', talentsRouter);
app.use('/profile',profileRouter);
app.use('/auth_api', authRouter);

module.exports = app;

