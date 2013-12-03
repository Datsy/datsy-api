module.exports = function(app, passport, Models){
  var user = Models.User,
      frontend = require('../controllers/frontend.js'),
      middleware = require('../middleware/middleware.js');

  // Initializes the models

  frontend.init(Models);


  // Defines the frontend routes

  app.get('/', frontend.index);

  app.post('/login',
    passport.authenticate('user', {failureRedirect : "#/user-login-fail"}),
    function(req, res) {
      res.redirect('/profile');
  });

  app.get('/profile', middleware.auth, frontend.profile);

  app.get('/logout', function(req, res){
    req.logout();

    // Also, destroy the req.session.passport.userType

    delete req.session.passport.userType;

    frontend.index(req, res);

  });

  app.get('/newdataset', middleware.auth, frontend.newdataset);
  app.get('/about', frontend.about);

  app.post('/signup', frontend.signup);
  app.get('/user-sign-up/checkEmail', frontend.checkEmailIfExists);
  app.get('/signup/:token', frontend.userSignupVerify);
  app.post('/uploadFile', frontend.uploadFile);
  app.get('/userTableMetaData', frontend.userTableMetaData);
  app.get('/tags', frontend.getAllTags);
};
