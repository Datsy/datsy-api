/**
 * Module dependencies.
 */

var express = require('express');
var http = require('http');
var path = require('path');
var config = require('./config/config.js');
var router = require('./config/routes.js');
var util = require('util');
var passport = require("passport");
var port = process.env.PORT || 5000;
var app = express();
var fs = require('fs');
var flash = require("connect-flash");
var uristring, Models;

// log process.env.NODE_ENV
console.log("****************************");
console.log("* Current ENV:", app.get('env'));
console.log("****************************");
////////////////////////////////////////
//Database initialization
////////////////////////////////////////
app.set('dbUrl', config.db[app.get('env')]);
uristring = app.get('dbUrl');

Models = require("./models/initModel.js")();

var models_dir = __dirname + '/models';
fs.readdirSync(models_dir).forEach(function (file) {
  if(file[0] === '.') return;
  require(models_dir+'/'+ file);
});

require('./config/passport')(passport, config, Models);

app.configure(function () {
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.cookieParser());
  app.use(express.bodyParser());
  app.use(express.session({ secret: 'keyboard cat' }));
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(express.methodOverride());
  app.use(flash());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

//if in development, use error handler
if (' development' == app.get(' env')){ 
  app.use( express.errorHandler()); 
}

app.use(function(err, req, res, next){
  console.log("ERROR:",err);
  res.status(err.status || 500);
  res.render('500', { error: err });
});

app.use(function(req, res, next){
  res.status(404);
  if (req.accepts('html')) {
    res.render('404', { url: req.url });
    return;
  }
  if (req.accepts('json')) {
    res.send({ error: 'Not found' });
    return;
  }
  res.type('txt').send('Not found');
});

router(app, passport, Models);

app.listen(port);