require('dotenv').config()

var express = require('express');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

const mongoose = require('mongoose');
const database = process.env.DATABASE || 'mongodb://localhost:27017';

var indexRouter = require('./routes/index');
const rateLimit = require("express-rate-limit");

const stats = require('./services/stats');

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

const limiter = rateLimit({
    windowMs: 10 * 1000, // 10 seconds
    max: 1 // limit each IP to 100 requests per windowMs
});

const statLimiter = rateLimit({
    windowMs: 1000, // 1 second
    max: 1 // limit each IP to 100 requests per windowMs
});

if(process.env.ENV !== 'development'){
    app.use('/report', limiter);
    app.use('/stats', statLimiter);
}

app.use('/', indexRouter);

mongoose.connect(database, {server: {auto_reconnect: true}})
    .then(() => {
        console.log("Connected to MongoDB")
        stats.startService();
    })
    .catch(error => {
        console.log("DB CONNECTION ERROR");
        console.log(error)
    });

module.exports = app;
