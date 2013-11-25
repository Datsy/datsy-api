module.exports = function(app,passport,Models){
  var jobApplicant = Models.JobApplicant;
  var home = require('../controllers/index.js')(Models);
  var ensureJobApplicantAuthenticated = require('../middleware/auth/middleware.js').ensureJobApplicantAuthenticated;

  //***************************************************
  // Configure to ensure authentication on this route
  //***************************************************
  // app.all('/worker/*',ensureJobApplicantAuthenticated,function(req,res,next){
  //   next();
  // });
  // app.all('/employer/*',ensureEmployerAuthenticated,function(req,res,next){
  //   next();
  // });

  //**********************************
  // define general routes that are accessible 
  // by both job applicant and employer 
  // (no authentication is required)
  //**********************************
  app.get('/', home.index);

  app.post("/worker-login", 
    passport.authenticate('jobApplicant', {failureRedirect : "#/worker-login-fail"}),
    function(req,res) {
      req.session.passport.userType = "jobApplicant";
      res.render('loginSuccessful');
    }
  );

  app.get('/logout', function(req, res){
    console.log("Before Logout Session:", req.session);
    req.logout();
    // Also destroy the req.session.passport.userType
    delete req.session.passport.userType
    console.log("After Logout Session:", req.session);
    res.writeHead(200);
    res.end();
  });

  app.get('/', home.index);
  app.post('/signup', home.signup);
  app.get('/worker-sign-up/checkEmail', home.checkEmailIfExists);
  app.get('/signup/:token', home.workerSignupVerify);
  app.post('/uploadFile', home.uploadFile);
  //**********************************
  // define admin routes
  //**********************************
  // app.get('/adminPanel', admin.allInfo)
  // app.post('/deleteEntry', admin.deleteEntry);

};
