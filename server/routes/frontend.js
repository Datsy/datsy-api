module.exports = function(app, passport, Models){
  var user = Models.User;
  var home = require('../controllers/frontend.js')(Models);
  var ensureUserAuthenticated = require('../middleware/auth/middleware.js').ensureUserAuthenticated;

  //***************************************************
  // Configure to ensure authentication on this route
  //***************************************************
  // app.all('/user/*',ensureUserAuthenticated,function(req,res,next){
  //   next();
  // });
  // app.all('/employer/*',ensureEmployerAuthenticated,function(req,res,next){
  //   next();
  // });

  //**********************************
  // define general routes that are accessible
  // by both user and employer
  // (no authentication is required)
  //**********************************
  // app.all('*', function(req, res, next) {
  //   res.header("Access-Control-Allow-Origin", "*");
  //   res.header("Access-Control-Allow-Headers", "X-Requested-With");
  //   res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  //   res.header('access-control-max-age', '100');
  //   next();
  // });

  app.get('/', home.index);

  app.post("/user-login",
    passport.authenticate('user', {failureRedirect : "#/user-login-fail"}),
    home.loginSuccess
  );

  app.get('/logout', function(req, res){
    console.log("Before Logout Session:", req.session);
    req.logout();
    // Also destroy the req.session.passport.userType
    delete req.session.passport.userType;
    console.log("After Logout Session:", req.session);
    res.writeHead(200);
    res.end();
  });

  app.get('/', home.index);
  app.post('/signup', home.signup);
  app.get('/user-sign-up/checkEmail', home.checkEmailIfExists);
  app.get('/signup/:token', home.userSignupVerify);
  app.post('/uploadFile', home.uploadFile);

  app.get('/userTableMetaData', home.userTableMetaData);
  app.get('/generateApiKey', home.generateApiKey);
  app.get('/dev', home.apiDev);
  app.get('/search', home.apiSearch);
  //**********************************
  // define admin routes
  //**********************************
  // app.get('/adminPanel', admin.allInfo)
  // app.post('/deleteEntry', admin.deleteEntry);

};
