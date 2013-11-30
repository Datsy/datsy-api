module.exports = function(app, passport, Models){
  var user = Models.User,
      frontend = require('../controllers/frontend.js'),
      ensureUserAuthenticated = require('../middleware/auth/middleware.js').ensureUserAuthenticated;

  // Initializes the models

  frontend.init(Models);


  // Defines the frontend routes

  app.get('/', frontend.index);

  app.post("/user-login",
    passport.authenticate('user', {failureRedirect : "#/user-login-fail"}),
    frontend.loginSuccess
  );

  app.get('/logout', function(req, res){
    req.logout();

    // Also, destroy the req.session.passport.userType

    delete req.session.passport.userType;

    res.writeHead(200);
    res.end();
  });

  app.get('/', frontend.index);
  app.post('/signup', frontend.signup);
  app.get('/user-sign-up/checkEmail', frontend.checkEmailIfExists);
  app.get('/signup/:token', frontend.userSignupVerify);
  app.post('/uploadFile', frontend.uploadFile);
  app.get('/userTableMetaData', frontend.userTableMetaData);
};
