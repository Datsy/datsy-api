module.exports = function(app, passport, Models) {
  var user = Models.User,
      frontend = require('../controllers/frontend.js')(Models),
      middleware = require('../middleware/middleware.js');

  // Initializes the models


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


  app.post('/signup', frontend.signup);
  app.get('/signup/:token', frontend.userSignupVerify);


  app.get('/newdataset', middleware.auth, frontend.newdataset);
  app.post('/uploadFile', middleware.auth, frontend.uploadFile);
  app.post('/saveDataset', middleware.auth, frontend.saveDataset);


  app.get('/about', frontend.about);
  app.get('/user-sign-up/checkEmail', frontend.checkEmailIfExists);
  app.get('/userTableMetaData', frontend.userTableMetaData);
  app.get('/search/meta', frontend.apiSearchMeta);
  app.get('/search/tag', frontend.apiSearchTags);
  app.get('/search/tag2', frontend.apiSearchTags2);
  app.get('/search/table', frontend.apiSearchTable);
};
