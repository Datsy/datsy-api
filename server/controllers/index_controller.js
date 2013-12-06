var middleware = require('../middleware/middleware.js');

var indexController = {
  init: function(req, res) {
    if (!middleware.isAuth(req)) {
      res.render('index');
    } else {
      res.render('index', {
        isAuthenticated: true,
        user: {
          username: req.user.name
        }
      });
    }
  },
  getdatasets: function() {
    
  }
};

module.exports = indexController;