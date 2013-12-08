var middleware = require('../middleware/middleware.js'),
    Schema = require('jugglingdb').Schema,
    User,
    Dataset,
    EmailToken,
    schema;


var indexController = {
  'init0': function(Models) {
    User = Models.User;
    Dataset = Models.Dataset;
    EmailToken = Models.EmailToken1;
    schema = Models.schema;
  },

  'init': function(req, res) {
    if (!middleware.isAuth(req)) {
      indexController.getdatasets(req, res, false);
    } else {
      indexController.getdatasets(req, res, true);
    }
  },

  'getdatasets': function(req, res, isloggedin) {
    Dataset.findAll().success(function(datasets) {
      if (isloggedin) {
        res.render('index', {
          datasets: datasets,
          isAuthenticated: isloggedin,
          user: {
            username: req.user.name
          }
        });
      } else {
        res.render('index', {
          datasets: datasets,
          isAuthenticated: isloggedin
        });
      }
    });
  }
};


module.exports = indexController;
