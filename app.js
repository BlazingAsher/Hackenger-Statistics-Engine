require('dotenv').config()

const fs = require('fs');

const express = require('express');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const cors = require('cors');

const mongoose = require('mongoose');
const database = process.env.DATABASE || 'mongodb://localhost:27017';

const indexRouter = require('./routes/index');
const rateLimit = require("express-rate-limit");

const stats = require('./services/stats');
const submissionHandler = require('./services/submissionHandler');

submissionHandler.init(JSON.parse(fs.readFileSync('questions.json', 'utf8')));

let app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors())

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
    app.use('/submit', limiter);
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
