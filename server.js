var express = require('express'),
    http = require('http'),
    path = require('path'),
    config = require('./config.js'),
    router = require('./server/config/routes.js'),
    util = require('util'),
    passport = require("passport"),
    port = process.env.PORT || 5000,
    app = express(),
    fs = require('fs'),
    flash = require("connect-flash"),
    uristring,
    Models,
    allowCrossDomain = require('./server/middleware/generalMiddleware.js')().allowCrossDomain;

// Log process.env.NODE_ENV

console.log("****************************");
console.log("* Current ENV:", app.get('env'));
console.log("****************************");

// Database initialization

Models = require("./server/models/initModel.js")(app);

require('./server/config/passport')(passport, config, Models);

app.configure(function () {
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/server/views');
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
  app.use(allowCrossDomain);
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'client')));
});


// If in development, use Express error handler

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
