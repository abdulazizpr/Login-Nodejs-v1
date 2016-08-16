//server.js

//set up
//get all the tools we need
var express = require('express');
var app = express();
var port = process.env.PORT || 8080;
var mongoose = require('mongoose');
var passport = require('passport');
var flash = require('connect-flash');
var nodemailer = require('nodemailer');
var hbs = require('nodemailer-express-handlebars');

var morgan = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');

var configDB = require('./config/database.js');

//conguration
mongoose.connect(configDB.url);//connect to our database

require('./config/passport')(passport); // pass passport for configuration




//set up our express application
app.use(morgan('dev')); //log evenet request to the console
app.use(cookieParser()); //read coockies (need for auth)
app.use(bodyParser()); //get information from html form

app.set('view engine','ejs'); // set up ejs for templating

//required for passport
app.use(session({secret:'ilovescotchscotchyscotchscotch'}));//session secret
app.use(passport.initialize());
app.use(passport.session());//persistent login session
app.use(flash());//use connect-flash for flash messages stored in session


//routes
require('./app/routes.js')(app, passport);;


//launch
app.listen(port);
console.log('The magic happens on port ' + port);

