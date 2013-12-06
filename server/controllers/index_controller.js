var middleware = require('../middleware/middleware.js'),
    Schema = require('jugglingdb').Schema,
    User,
    Metadata,
    EmailToken,
    schema,
    Tag,
    Dataset;


var indexController = {
  init: function(req, res) {
    if (!middleware.isAuth(req)) {
      res.render('index');
    } else {
      getdatasets(req, res);
      // res.render('index', {
      //   isAuthenticated: true,
      //   user: {
      //     username: req.user.name
      //   }
      // });
    }
  },
  getdatasets: function(req, res) {
    Metadata.Dataset.all(function(err, datasets) {
      if (err) {
        res.writeHead(500);
        res.end("500 Internal Server Error error:", err);
      } else {
        res.render('index', {
          datasets: datasets,
          // view_count: view_count,
          // apiKey: req.user.apikey,
          isAuthenticated: true,
          // user: {
          //   username: req.user.name
          // }
        });
      }
  });
}

module.exports = indexController;