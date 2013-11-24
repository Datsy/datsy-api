module.exports = function (passport, config, Models) {
  var JobApplicant = Models.JobApplicant;
  var LocalStrategy = require('passport-local').Strategy;

  passport.serializeUser(function(user, done) {
	  done(null, user.id);
  });

  passport.deserializeUser(function(id, done) {
    JobApplicant.findOne({where:{ "_id": id }}, function (err, user) {
      done(err, user);
    });
  });

  passport.use('jobApplicant', new LocalStrategy({
	  usernameField: 'email',
	  passwordField: 'password'
  },
  function(email, password, done) {
    console.log("In passport");
    JobApplicant.prototype.isValidUserPassword(email, password, done);
  }));

}