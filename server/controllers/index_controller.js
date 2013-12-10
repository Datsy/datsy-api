var middleware = require('../middleware/middleware.js'),
    Schema = require('jugglingdb').Schema,
    User,
    Metadata,
    EmailToken,
    schema;

// var getdatasets = function(req, res) {
//   Metadata.Dataset.all(function(err, datasets) {
//     if (err) {
//       res.writeHead(500);
//       res.end("500 Internal Server Error error:", err);
//     } else {
//       console.log('emma data set', datasets);
//       res.render('index', {
//         datasets: datasets,
//         // view_count: view_count,
//         // apiKey: req.user.apikey,
//         isAuthenticated: true,
//         // user: {
//         //   username: req.user.name
//         // }
//       });
//     }
//   });
// };

var indexController = {
  init0: function(User1, Metadata1, EmailToken1, schema1) {
    User = User1;
    Metadata = Metadata1;
    EmailToken = EmailToken1;
    schema = schema1;
  },
  init: function(req, res) {
    if (!middleware.isAuth(req)) {
      indexController.getdatasets(req, res, false);
    } else {
      indexController.getdatasets(req, res, true);
    }
  },
  getdatasets : function(req, res, isloggedin) {
  Metadata.Dataset.all(function(err, datasets) {
    if (err) {
      res.writeHead(500);
      res.end("500 Internal Server Error error:", err);
    } else {
      
      if (isloggedin){
      console.log('data sets is ', datasets);
      res.render('index2', {
        datasets: datasets,
        // view_count: view_count,
        // apiKey: req.user.apikey,
        isAuthenticated: isloggedin,
        user: {
          username: req.user.name
        }
      });
      } else {
          res.render('index2', {
            datasets: datasets,
            isAuthenticated: isloggedin,
          });
        }
      }
    });
  }
}
module.exports = indexController;