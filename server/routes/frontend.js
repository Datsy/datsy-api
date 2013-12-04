module.exports = function(app, passport, Models, schema){
  var user = Models.User,
      frontend = require('../controllers/frontend.js'),
      middleware = require('../middleware/middleware.js');

  // Initializes the models

  frontend.init(Models, schema);


  // Defines the frontend routes

  app.get('/', frontend.index);

  app.post("/login",
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
  app.post('/uploadFile', middleware.auth, frontend.uploadFile);
  app.post('/saveDataset', middleware.auth, frontend.saveDataset);
  app.get('/about', frontend.about);
  app.post('/signup', frontend.signup);
  app.get('/user-sign-up/checkEmail', frontend.checkEmailIfExists);
  app.get('/signup/:token', frontend.userSignupVerify);
  app.get('/userTableMetaData', frontend.userTableMetaData);
  app.get('/search/meta', frontend.apiSearchMeta);
  app.get('/search/tag', frontend.apiSearchTags);
};
