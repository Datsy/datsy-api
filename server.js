var express = require('express'),
    path = require('path'),
    config = require('./config.js'),
    routes = require('./server/routes'),
    passport = require("passport"),
    pingHost = require("./server/helpers/pingHost.js"),
    port = process.env.PORT || 5000,
    app = express(),
    flash = require("connect-flash"),
    allowCrossDomain = require('./server/middleware/generalMiddleware.js')().allowCrossDomain;


// Log process.env.NODE_ENV

console.log("****************************");
console.log("* Current ENV:", app.get('env'));
console.log("****************************");


// Initialize database models

var ORM = require("./server/models/initModel.js")(app),
    Models = ORM.Models,
    schema = ORM.schema;


// Initialize passport

require('./server/config/passport')(passport, config, Models);


// Configure Express server

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

// Initialize routing

routes.frontend(app, passport, Models, schema);

// TODO: add api routes


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

app.listen(port, function(){
  // make database query to make database connection alive
  
  var request = require('request');
  var httpReqToPing = function(){
    request('http://datsy-dev.azurewebsites.net/search/tag', function (error, response, body) {
      if (!error && response.statusCode == 200) {
        console.log("azure database is alive"); // Print the google web page.
      } else {
        console.log('ERROR: azure database is DEAD!!!',response.statusCode);
      }
    });
  }

  // var useDatabaseReqToPing = function(){
  //   var User = Models.User;
  //   User.findOne({where: {id: 1}},
  //     function (err, result) {
  //       var msg = err ? 'ERROR: azure database is DEAD!!!' + err : 'azure database is alive'; 
  //       console.log(msg);
  //   });
  // };

  setInterval(httpReqToPing, 20000);

  //ping virtual macihne not working at this time
  //pingHost([config[app.get('env')].database.host]);
});
