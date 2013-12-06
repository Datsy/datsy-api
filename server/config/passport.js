module.exports = function (passport, config, Models) {
  var User = Models.User,
      LocalStrategy = require('passport-local').Strategy,
      hash = require('password-hash');

  passport.serializeUser(function(user, done) {
    done(null, user.id);
  });

  passport.deserializeUser(function(id, done) {
    User.findAll({
      where:{ "id": id }
    }).success(function(user) {
      if (user) {
        done(null, user);
      } else {
        done (null, false)
      }
    });
  });

  passport.use('user', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
  },
  function(email, password, done) {
    Models.User.findAll({
      where: { email: email }
    }).success(function(user) {
      if (user) {
        var matched = hash.verify(password, user[0].password);
        if (matched) {
          return done(null, user[0], {message: 'Successful Login.'});
        } else {
          return done(null, false, { message: 'Incorrect Password.'});
        }
     } else {
       return done(null, false, { message: 'Unrecognized Email.'});
     }
    });
  }));
};
