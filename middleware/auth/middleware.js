
var authMiddleware = {};

var isAuthenticated = function(req, userType) {
  var property = 'user';
  if (req._passport && req._passport.instance._userProperty) {
    property = req._passport.instance._userProperty;
  }
  return ((req[property]) && (req.session.passport.userType === userType)) ? true : false;
};

authMiddleware.ensureEmployerAuthenticated = function(req, res, next) {
  if (isAuthenticated(req, "employer")){
    console.log("----->route is authenticated for Employer");
    return next();
  }
  else{
    console.log("------>route is not authenticated for Employer");
    res.redirect('/employer-login-fail');
  }
}

authMiddleware.ensureJobApplicantAuthenticated = function(req, res, next) {
  if (isAuthenticated(req, "jobApplicant")){
    console.log("--->route is authenticated for Job Applicant");
    return next();
  }
  else{
    console.log("--->route is not authenticated for Job Applicant");
    res.redirect('/worker-login-fail');
  }
}

module.exports = authMiddleware;