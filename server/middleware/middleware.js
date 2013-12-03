var isAuthenticated = function(req, userType) {
  var property = 'user';
  if (req._passport && req._passport.instance._userProperty) {
    property = req._passport.instance._userProperty;
  }
  return ((req[property]) && (req.session.passport.userType === userType)) ? true : false;
};


var middleware = {
  auth: function(req, res, next) {
    if (!req.session.passport.user) {
      return res.redirect('/');
    }
    next();
  },

  isAuth: function(req, res, next) {
    if (!req.session.passport.user) {
      return false;
    }
    return true;
  }
};

module.exports = middleware;
