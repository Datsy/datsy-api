module.exports = function (passport, config, Models) {
  var User = Models.User;
  var LocalStrategy = require('passport-local').Strategy;

  passport.serializeUser(function(user, done) {
	  done(null, user.id);
  });

  passport.deserializeUser(function(id, done) {
    User.findOne({where:{ "_id": id }}, function (err, user) {
      done(err, user);
    });
  });

  passport.use('user', new LocalStrategy({
	  usernameField: 'email',
	  passwordField: 'password'
  },
  function(email, password, done) {
    User.prototype.isValidUserPassword(email, password, done);
  }));

}